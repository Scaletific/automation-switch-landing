/**
 * /api/sync/search-console — Google Search Console sync endpoint
 *
 * Triggered by:
 *   • Vercel Cron (optional) — Authorization: Bearer CRON_SECRET
 *   • Manual POST            — x-sync-secret: YOUR_SYNC_SECRET header
 *
 * Required environment variables:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64)
 *   GOOGLE_SEARCH_CONSOLE_SITE_URL
 *   SYNC_SECRET
 * Optional:
 *   CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  defaultDateRange,
  querySearchConsole,
  type SearchAnalyticsDimension,
} from '@/lib/google-search-console'

export const runtime = 'nodejs'

const ALLOWED_DIMENSIONS: SearchAnalyticsDimension[] = [
  'date',
  'query',
  'page',
  'country',
  'device',
  'searchAppearance',
]

function isAuthorised(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true

  const manualSecret =
    req.headers.get('x-sync-secret') ??
    req.nextUrl.searchParams.get('secret')
  if (manualSecret && manualSecret === process.env.SYNC_SECRET) return true

  return false
}

function numberOrDefault(
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.max(min, Math.min(max, Math.floor(value)))
}

export async function POST(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const parsedBody = await req.json().catch(() => ({} as unknown))
    const body: Record<string, unknown> =
      parsedBody && typeof parsedBody === 'object' && !Array.isArray(parsedBody)
        ? parsedBody as Record<string, unknown>
        : {}
    const siteUrl = (
      (typeof body.siteUrl === 'string' && body.siteUrl) ||
      process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL
    )

    if (!siteUrl) {
      return NextResponse.json(
        { ok: false, error: 'GOOGLE_SEARCH_CONSOLE_SITE_URL is not set' },
        { status: 400 }
      )
    }

    const daysBack = numberOrDefault(body.daysBack, 7, 1, 30)
    const range = defaultDateRange(daysBack)
    const startDate = typeof body.startDate === 'string' ? body.startDate : range.startDate
    const endDate   = typeof body.endDate === 'string' ? body.endDate : range.endDate

    const dimensions: SearchAnalyticsDimension[] = Array.isArray(body.dimensions)
      ? body.dimensions.filter((v): v is SearchAnalyticsDimension =>
          typeof v === 'string' && ALLOWED_DIMENSIONS.includes(v as SearchAnalyticsDimension)
        )
      : ['query']
    if (dimensions.length === 0) dimensions.push('query')

    const data = await querySearchConsole(siteUrl, {
      startDate,
      endDate,
      dimensions,
      rowLimit: numberOrDefault(body.rowLimit, 25, 1, 25000),
      startRow: numberOrDefault(body.startRow, 0, 0, 1000000),
      searchType: typeof body.searchType === 'string' ? body.searchType as
        'web' | 'image' | 'video' | 'news' | 'discover' | 'googleNews' : 'web',
      dataState: typeof body.dataState === 'string' && body.dataState === 'all' ? 'all' : 'final',
    })

    const rows = data.rows ?? []
    const totals = rows.reduce<{ clicks: number; impressions: number }>(
      (acc, row) => {
        acc.clicks += row.clicks ?? 0
        acc.impressions += row.impressions ?? 0
        return acc
      },
      { clicks: 0, impressions: 0 }
    )

    return NextResponse.json({
      ok: true,
      summary: {
        siteUrl,
        startDate,
        endDate,
        dimensions,
        rows: rows.length,
        clicks: totals.clicks,
        impressions: totals.impressions,
      },
      data,
    })
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[search-console] Fatal error:', error)
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({
      ok:       true,
      endpoint: 'Google Search Console sync',
      usage:    'POST with x-sync-secret header to trigger',
    })
  }

  return NextResponse.json({
    ok: true,
    endpoint: 'Google Search Console sync',
    ready: {
      siteUrl:            !!process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL,
      serviceAccount:     !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey:         !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      privateKeyBase64:   !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64,
      syncSecret:         !!process.env.SYNC_SECRET,
      cronSecret:         !!process.env.CRON_SECRET,
    },
  })
}
