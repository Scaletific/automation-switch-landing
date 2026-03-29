/**
 * /api/sync/skills — Firecrawl/GitHub skill count updater endpoint
 *
 * Triggered by:
 *   • Vercel Cron (Mondays 10:00 UTC) — Authorization: Bearer CRON_SECRET
 *   • Manual POST  — x-sync-secret: YOUR_SYNC_SECRET header
 *
 * Required environment variables:
 *   SANITY_API_TOKEN     — Sanity read token
 *   SANITY_WRITE_TOKEN   — Sanity editor/write token
 *   FIRECRAWL_API_KEY    — Firecrawl API key (for non-GitHub sources)
 *   SYNC_SECRET          — Shared secret for manual triggers
 *   CRON_SECRET          — Vercel-managed secret (auto-set in Vercel)
 * Optional:
 *   GITHUB_TOKEN         — Raises GitHub API rate limit 60 → 5,000 req/hr
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncSkillCounts } from '@/lib/skills-sync'

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

function isAuthorised(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true

  const manualSecret =
    req.headers.get('x-sync-secret') ??
    req.nextUrl.searchParams.get('secret')
  if (manualSecret && manualSecret === process.env.SYNC_SECRET) return true

  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — run the sync
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  console.log('[sync] POST /api/sync/skills — starting')

  try {
    const result = await syncSkillCounts()

    return NextResponse.json({
      ok: true,
      summary: {
        updated:   result.updated.length,
        unchanged: result.unchanged.length,
        failed:    result.failed.length,
        duration:  `${result.duration}ms`,
      },
      detail: result,
    })
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[sync] Fatal error:', error)
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — health check
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({
      ok:       true,
      endpoint: 'Firecrawl/GitHub skill count sync',
      usage:    'POST with x-sync-secret header to trigger',
    })
  }

  return NextResponse.json({
    ok:       true,
    endpoint: 'Firecrawl/GitHub skill count sync',
    ready: {
      sanityReadToken:  !!process.env.SANITY_API_TOKEN,
      sanityWriteToken: !!process.env.SANITY_WRITE_TOKEN,
      firecrawlKey:     !!process.env.FIRECRAWL_API_KEY,
      githubToken:      !!process.env.GITHUB_TOKEN,
      syncSecret:       !!process.env.SYNC_SECRET,
      cronSecret:       !!process.env.CRON_SECRET,
    },
  })
}
