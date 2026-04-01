import { defaultDateRange, querySearchConsole } from '@/lib/google-search-console'

export type AuditState = 'pass' | 'warn' | 'fail'

export interface AuditCheck {
  name: string
  state: AuditState
  details: string
  meta?: Record<string, unknown>
}

export interface GoogleIndexingAuditResult {
  status: AuditState
  ranAt: string
  targetBaseUrl: string
  checks: AuditCheck[]
}

const DEFAULT_BASE_URL = 'https://automationswitch.com'

function score(state: AuditState): number {
  if (state === 'fail') return 2
  if (state === 'warn') return 1
  return 0
}

function worstState(states: AuditState[]): AuditState {
  const worst = states.reduce((max, s) => Math.max(max, score(s)), 0)
  if (worst === 2) return 'fail'
  if (worst === 1) return 'warn'
  return 'pass'
}

async function fetchText(url: string): Promise<{ ok: boolean; status: number; text: string }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) })
  return {
    ok: res.ok,
    status: res.status,
    text: await res.text(),
  }
}

function configuredForSearchConsole(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64) &&
    process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL
  )
}

export async function runGoogleIndexingAudit(input?: {
  baseUrl?: string
  requireSearchConsole?: boolean
}): Promise<GoogleIndexingAuditResult> {
  const baseUrl = (input?.baseUrl ?? process.env.AUDIT_SITE_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
  const checks: AuditCheck[] = []

  try {
    const robotsUrl = `${baseUrl}/robots.txt`
    const robots = await fetchText(robotsUrl)
    const hasSitemapDirective = /(?:^|\n)\s*Sitemap:\s*https?:\/\/\S+/i.test(robots.text)
    const details = robots.ok
      ? hasSitemapDirective
        ? `robots.txt reachable (${robots.status}) with sitemap directive`
        : `robots.txt reachable (${robots.status}) but missing Sitemap directive`
      : `robots.txt unreachable (${robots.status})`

    checks.push({
      name: 'robots',
      state: robots.ok ? (hasSitemapDirective ? 'pass' : 'warn') : 'fail',
      details,
      meta: { url: robotsUrl },
    })
  } catch (err) {
    checks.push({
      name: 'robots',
      state: 'fail',
      details: err instanceof Error ? err.message : String(err),
      meta: { url: `${baseUrl}/robots.txt` },
    })
  }

  try {
    const sitemapUrl = `${baseUrl}/sitemap.xml`
    const sitemap = await fetchText(sitemapUrl)
    const looksLikeSitemap = /<(urlset|sitemapindex)\b/i.test(sitemap.text)
    const urlCount = (sitemap.text.match(/<url>/g) ?? []).length

    checks.push({
      name: 'sitemap',
      state: sitemap.ok && looksLikeSitemap ? 'pass' : 'fail',
      details: sitemap.ok
        ? looksLikeSitemap
          ? `sitemap.xml reachable (${sitemap.status}) with ${urlCount} url entries`
          : `sitemap.xml reachable (${sitemap.status}) but content is not valid sitemap XML`
        : `sitemap.xml unreachable (${sitemap.status})`,
      meta: { url: sitemapUrl, urlCount },
    })
  } catch (err) {
    checks.push({
      name: 'sitemap',
      state: 'fail',
      details: err instanceof Error ? err.message : String(err),
      meta: { url: `${baseUrl}/sitemap.xml` },
    })
  }

  const requireSearchConsole = Boolean(input?.requireSearchConsole)
  if (!configuredForSearchConsole()) {
    checks.push({
      name: 'search_console',
      state: requireSearchConsole ? 'fail' : 'warn',
      details: 'Search Console credentials/site URL are not fully configured',
    })
  } else {
    try {
      const range = defaultDateRange(7)
      const data = await querySearchConsole(process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL!, {
        startDate: range.startDate,
        endDate: range.endDate,
        dimensions: ['page'],
        rowLimit: 25,
      })

      const rows = data.rows ?? []
      const impressions = rows.reduce((sum, row) => sum + (row.impressions ?? 0), 0)
      checks.push({
        name: 'search_console',
        state: 'pass',
        details: `Search Console query succeeded for ${range.startDate}..${range.endDate}`,
        meta: { rows: rows.length, impressions },
      })
    } catch (err) {
      checks.push({
        name: 'search_console',
        state: 'fail',
        details: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return {
    status: worstState(checks.map((c) => c.state)),
    ranAt: new Date().toISOString(),
    targetBaseUrl: baseUrl,
    checks,
  }
}
