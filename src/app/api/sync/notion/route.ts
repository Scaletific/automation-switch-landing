/**
 * /api/sync/notion — Notion → Sanity sync endpoint
 *
 * Triggered by:
 *   • Vercel Cron (every 30 min) — Authorization: Bearer CRON_SECRET header
 *   • Manual POST — x-sync-secret: YOUR_SYNC_SECRET header
 *
 * Required environment variables:
 *   NOTION_API_TOKEN        — Notion integration token
 *   NOTION_ARTICLES_DB_ID   — 1c0a0caa82bd4e9c96f85b55f93440aa
 *   SANITY_WRITE_TOKEN      — Sanity editor/write token
 *   SYNC_SECRET             — Shared secret for manual triggers
 *   CRON_SECRET             — Vercel-managed secret for cron (auto-set in Vercel)
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncNotionToSanity } from '@/lib/notion-sync'

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

function isAuthorised(req: NextRequest): boolean {
  // Vercel Cron sends: Authorization: Bearer CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true

  // Manual trigger: x-sync-secret header or ?secret= query param
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

  console.log('[sync] POST /api/sync/notion — starting')

  try {
    const result = await syncNotionToSanity()

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
// GET — health check / status
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    // Return 200 for unauthenticated GET — Vercel health checks use this
    return NextResponse.json({
      ok: true,
      endpoint: 'Notion → Sanity sync',
      usage: 'POST with x-sync-secret header to trigger',
    })
  }

  return NextResponse.json({
    ok: true,
    endpoint:  'Notion → Sanity sync',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'l4o4vshf',
    dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
    notionDb:  process.env.NOTION_ARTICLES_DB_ID ?? '(not set)',
    ready: {
      notionToken:  !!process.env.NOTION_API_TOKEN,
      sanityToken:  !!process.env.SANITY_WRITE_TOKEN,
      syncSecret:   !!process.env.SYNC_SECRET,
      cronSecret:   !!process.env.CRON_SECRET,
      notionDbId:   !!process.env.NOTION_ARTICLES_DB_ID,
    },
  })
}
