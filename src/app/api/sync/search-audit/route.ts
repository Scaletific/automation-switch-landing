/**
 * /api/sync/search-audit — Google indexing readiness audit endpoint
 *
 * Triggered by:
 *   • Vercel Cron (optional) — Authorization: Bearer CRON_SECRET
 *   • Manual POST            — x-sync-secret: YOUR_SYNC_SECRET header
 */

import { NextRequest, NextResponse } from 'next/server'
import { runGoogleIndexingAudit } from '@/lib/google-indexing-audit'

export const runtime = 'nodejs'

function isAuthorised(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true

  const manualSecret =
    req.headers.get('x-sync-secret') ??
    req.nextUrl.searchParams.get('secret')
  if (manualSecret && manualSecret === process.env.SYNC_SECRET) return true

  return false
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

    const result = await runGoogleIndexingAudit({
      baseUrl: typeof body.baseUrl === 'string' ? body.baseUrl : undefined,
      requireSearchConsole: body.requireSearchConsole === true,
    })

    const status = result.status === 'fail' ? 500 : 200
    return NextResponse.json({ ok: result.status !== 'fail', result }, { status })
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[search-audit] Fatal error:', error)
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({
      ok: true,
      endpoint: 'Google indexing audit',
      usage: 'POST with x-sync-secret header to run checks',
    })
  }

  return NextResponse.json({
    ok: true,
    endpoint: 'Google indexing audit',
    ready: {
      syncSecret: !!process.env.SYNC_SECRET,
      cronSecret: !!process.env.CRON_SECRET,
      baseUrl: !!process.env.AUDIT_SITE_BASE_URL,
      siteProperty: !!process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL,
      serviceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    },
  })
}
