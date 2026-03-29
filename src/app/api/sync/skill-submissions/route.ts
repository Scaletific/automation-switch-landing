/**
 * /api/sync/skill-submissions — Notion Submissions → Sanity sync endpoint
 *
 * Triggered by:
 *   • Vercel Cron (Mondays 09:00 UTC) — Authorization: Bearer CRON_SECRET
 *   • Manual POST  — x-sync-secret: YOUR_SYNC_SECRET header
 *
 * Required environment variables:
 *   NOTION_API_TOKEN        — Notion integration token
 *   NOTION_SUBMISSIONS_DB_ID — Skill Submissions DB ID
 *   SANITY_WRITE_TOKEN      — Sanity editor/write token
 *   SYNC_SECRET             — Shared secret for manual triggers
 *   CRON_SECRET             — Vercel-managed secret (auto-set in Vercel)
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncSkillSubmissions } from '@/lib/skill-submissions-sync'

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

  console.log('[sync] POST /api/sync/skill-submissions — starting')

  try {
    const result = await syncSkillSubmissions()

    return NextResponse.json({
      ok: true,
      summary: {
        synced:   result.synced.length,
        skipped:  result.skipped.length,
        errors:   result.errors.length,
        duration: `${result.duration}ms`,
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
      endpoint: 'Notion Skill Submissions → Sanity sync',
      usage:    'POST with x-sync-secret header to trigger',
    })
  }

  return NextResponse.json({
    ok:       true,
    endpoint: 'Notion Skill Submissions → Sanity sync',
    ready: {
      notionToken:     !!process.env.NOTION_API_TOKEN,
      submissionsDbId: !!process.env.NOTION_SUBMISSIONS_DB_ID,
      sanityToken:     !!process.env.SANITY_WRITE_TOKEN,
      syncSecret:      !!process.env.SYNC_SECRET,
      cronSecret:      !!process.env.CRON_SECRET,
    },
  })
}
