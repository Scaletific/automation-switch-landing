import type { QueryBody } from '@/lib/gsc/google-client'
import { querySearchConsoleOAuth } from '@/lib/gsc/google-client'

type AuditState = 'pass' | 'warn' | 'fail'

interface AuditCheck {
  name: string
  state: AuditState
  details: string
  meta?: Record<string, unknown>
}

function deriveBaseUrl(siteUrl: string): string {
  if (siteUrl.startsWith('sc-domain:')) {
    const domain = siteUrl.replace('sc-domain:', '')
    return `https://${domain}`
  }
  return siteUrl.replace(/\/+$/, '')
}

async function fetchText(url: string): Promise<{ ok: boolean; status: number; text: string }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) })
  return { ok: res.ok, status: res.status, text: await res.text() }
}

function worstAuditState(checks: AuditCheck[]): AuditState {
  if (checks.some((c) => c.state === 'fail')) return 'fail'
  if (checks.some((c) => c.state === 'warn')) return 'warn'
  return 'pass'
}

function dateOffsetUtc(daysAgo: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

function normalizeRows(data: Record<string, unknown>): Array<{
  keys?: string[]
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
}> {
  const rows = data.rows
  if (!Array.isArray(rows)) return []
  return rows
    .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === 'object'))
    .map((row) => ({
      keys: Array.isArray(row.keys) ? row.keys.filter((k): k is string => typeof k === 'string') : undefined,
      clicks: typeof row.clicks === 'number' ? row.clicks : undefined,
      impressions: typeof row.impressions === 'number' ? row.impressions : undefined,
      ctr: typeof row.ctr === 'number' ? row.ctr : undefined,
      position: typeof row.position === 'number' ? row.position : undefined,
    }))
}

export async function runIndexingBasicsAudit(args: {
  accessToken: string
  siteUrl: string
  baseUrl?: string
}): Promise<{
  checks: AuditCheck[]
  status: AuditState
  summary: string
}> {
  const baseUrl = args.baseUrl?.replace(/\/+$/, '') || deriveBaseUrl(args.siteUrl)
  const checks: AuditCheck[] = []

  try {
    const robots = await fetchText(`${baseUrl}/robots.txt`)
    const hasSitemapDirective = /(?:^|\n)\s*Sitemap:\s*https?:\/\/\S+/i.test(robots.text)
    checks.push({
      name: 'robots',
      state: robots.ok ? (hasSitemapDirective ? 'pass' : 'warn') : 'fail',
      details: robots.ok
        ? hasSitemapDirective
          ? 'robots.txt reachable with sitemap directive'
          : 'robots.txt reachable but missing sitemap directive'
        : `robots.txt unreachable (${robots.status})`,
    })
  } catch (err) {
    checks.push({
      name: 'robots',
      state: 'fail',
      details: err instanceof Error ? err.message : String(err),
    })
  }

  try {
    const sitemap = await fetchText(`${baseUrl}/sitemap.xml`)
    const xmlLike = /<(urlset|sitemapindex)\b/i.test(sitemap.text)
    checks.push({
      name: 'sitemap',
      state: sitemap.ok && xmlLike ? 'pass' : 'fail',
      details: sitemap.ok
        ? xmlLike
          ? 'sitemap.xml reachable and valid'
          : 'sitemap.xml reachable but invalid sitemap XML'
        : `sitemap.xml unreachable (${sitemap.status})`,
    })
  } catch (err) {
    checks.push({
      name: 'sitemap',
      state: 'fail',
      details: err instanceof Error ? err.message : String(err),
    })
  }

  try {
    const data = await querySearchConsoleOAuth(args.accessToken, args.siteUrl, {
      startDate: dateOffsetUtc(8),
      endDate: dateOffsetUtc(1),
      dimensions: ['page'],
      rowLimit: 25,
      startRow: 0,
      searchType: 'web',
      dataState: 'final',
    })
    const rows = normalizeRows(data)
    const impressions = rows.reduce((sum, row) => sum + (row.impressions ?? 0), 0)
    checks.push({
      name: 'search_console_data',
      state: impressions > 0 ? 'pass' : 'warn',
      details: impressions > 0
        ? `Search Console data available (${impressions.toLocaleString()} impressions in sample window)`
        : 'Search Console query returned zero impressions in sample window',
      meta: { rows: rows.length, impressions },
    })
  } catch (err) {
    checks.push({
      name: 'search_console_data',
      state: 'fail',
      details: err instanceof Error ? err.message : String(err),
    })
  }

  const status = worstAuditState(checks)
  const summary = status === 'pass'
    ? 'Indexing basics look healthy'
    : status === 'warn'
      ? 'Indexing basics need attention'
      : 'Indexing basics failed critical checks'

  return { checks, status, summary }
}

export async function findPageImpressionDrops(args: {
  accessToken: string
  siteUrl: string
}): Promise<{
  baselineStart: string
  baselineEnd: string
  currentStart: string
  currentEnd: string
  drops: Array<{
    page: string
    currentImpressions: number
    previousImpressions: number
    delta: number
    deltaPct: number
  }>
}> {
  const currentStart = dateOffsetUtc(8)
  const currentEnd = dateOffsetUtc(1)
  const baselineStart = dateOffsetUtc(15)
  const baselineEnd = dateOffsetUtc(9)

  const common: Omit<QueryBody, 'startDate' | 'endDate'> = {
    dimensions: ['page'],
    rowLimit: 250,
    startRow: 0,
    searchType: 'web',
    dataState: 'final',
  }
  const [currentData, baselineData] = await Promise.all([
    querySearchConsoleOAuth(args.accessToken, args.siteUrl, { ...common, startDate: currentStart, endDate: currentEnd }),
    querySearchConsoleOAuth(args.accessToken, args.siteUrl, { ...common, startDate: baselineStart, endDate: baselineEnd }),
  ])

  const asMap = (data: Record<string, unknown>) => {
    const map = new Map<string, number>()
    for (const row of normalizeRows(data)) {
      const page = row.keys?.[0]
      if (!page) continue
      map.set(page, row.impressions ?? 0)
    }
    return map
  }
  const currentMap = asMap(currentData)
  const baselineMap = asMap(baselineData)
  const pages = new Set([...currentMap.keys(), ...baselineMap.keys()])

  const drops = Array.from(pages).map((page) => {
    const current = currentMap.get(page) ?? 0
    const previous = baselineMap.get(page) ?? 0
    const delta = current - previous
    const deltaPct = previous > 0 ? (delta / previous) * 100 : 0
    return {
      page,
      currentImpressions: current,
      previousImpressions: previous,
      delta,
      deltaPct,
    }
  })
    .filter((item) => item.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 20)

  return { baselineStart, baselineEnd, currentStart, currentEnd, drops }
}

export async function findQueryOpportunities(args: {
  accessToken: string
  siteUrl: string
}): Promise<{
  startDate: string
  endDate: string
  opportunities: Array<{
    query: string
    impressions: number
    clicks: number
    ctr: number
    position: number
  }>
}> {
  const endDate = dateOffsetUtc(1)
  const startDate = dateOffsetUtc(28)
  const data = await querySearchConsoleOAuth(args.accessToken, args.siteUrl, {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 1000,
    startRow: 0,
    searchType: 'web',
    dataState: 'final',
  })

  const opportunities = normalizeRows(data)
    .map((row) => ({
      query: row.keys?.[0] ?? '',
      impressions: row.impressions ?? 0,
      clicks: row.clicks ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }))
    .filter((row) => row.query && row.impressions >= 100 && row.ctr <= 0.02)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25)

  return { startDate, endDate, opportunities }
}

export async function generateActionPlan(args: {
  accessToken: string
  siteUrl: string
  baseUrl?: string
}): Promise<{
  generatedAt: string
  recommendations: string[]
  signals: Record<string, unknown>
}> {
  const [audit, drops, opportunities] = await Promise.all([
    runIndexingBasicsAudit(args),
    findPageImpressionDrops(args),
    findQueryOpportunities(args),
  ])

  const recommendations: string[] = []
  if (audit.status !== 'pass') {
    recommendations.push('Fix robots.txt and sitemap health issues before content-level SEO work.')
  }
  if (drops.drops.length > 0) {
    const top = drops.drops[0]
    recommendations.push(`Investigate the largest page impression drop: ${top.page} (${top.deltaPct.toFixed(1)}%).`)
  }
  if (opportunities.opportunities.length > 0) {
    const topQuery = opportunities.opportunities[0]
    recommendations.push(`Prioritize CTR optimization for query "${topQuery.query}" (high impressions, low CTR).`)
  }
  if (recommendations.length === 0) {
    recommendations.push('No major negative signal detected. Continue weekly monitoring and title/meta testing.')
  }

  return {
    generatedAt: new Date().toISOString(),
    recommendations,
    signals: {
      auditStatus: audit.status,
      dropsFound: drops.drops.length,
      opportunitiesFound: opportunities.opportunities.length,
    },
  }
}
