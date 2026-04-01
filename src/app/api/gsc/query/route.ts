import { NextRequest, NextResponse } from 'next/server'
import { isFeatureEnabled, parseJsonBody } from '@/lib/gsc/auth'
import {
  getValidAccessToken,
  querySearchConsoleOAuth,
  type QueryBody,
} from '@/lib/gsc/google-client'
import { attachSessionCookie, resolveSessionIdentity } from '@/lib/gsc/session'
import { getGscStore } from '@/lib/gsc/store'

export const runtime = 'nodejs'

const ALLOWED_DIMENSIONS = ['date', 'query', 'page', 'country', 'device', 'searchAppearance'] as const
const ALLOWED_SEARCH_TYPES = ['web', 'image', 'video', 'news', 'discover', 'googleNews'] as const

function numberOrDefault(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.max(min, Math.min(max, Math.floor(value)))
}

export async function POST(req: NextRequest) {
  if (!isFeatureEnabled()) {
    return NextResponse.json({ ok: false, error: 'Feature disabled' }, { status: 404 })
  }

  const identity = resolveSessionIdentity(req)
  const store = getGscStore()
  store.upsertUser(identity.userId)

  const payload = parseJsonBody<Record<string, unknown>>(await req.json().catch(() => ({})))
  const siteUrl = typeof payload.siteUrl === 'string' ? payload.siteUrl : ''
  if (!siteUrl) {
    const res = NextResponse.json({ ok: false, error: 'siteUrl is required' }, { status: 400 })
    attachSessionCookie(res, identity)
    return res
  }
  const property = store.getPropertyForUser(identity.userId, siteUrl)
  if (!property) {
    const res = NextResponse.json({ ok: false, error: 'Property not found for current user' }, { status: 403 })
    attachSessionCookie(res, identity)
    return res
  }

  const connection = store.getConnectionById(property.connectionId)
  if (!connection) {
    const res = NextResponse.json({ ok: false, error: 'Connection not found' }, { status: 404 })
    attachSessionCookie(res, identity)
    return res
  }

  const run = store.createRun({
    userId: identity.userId,
    type: 'query',
    siteUrl,
    input: payload,
  })
  store.setRunStatus(run.id, 'running')
  store.appendRunEvent(run.id, identity.userId, {
    level: 'info',
    message: 'Search Console query started',
  })

  try {
    const { accessToken } = await getValidAccessToken(req, connection)
    const dimensions = Array.isArray(payload.dimensions)
      ? payload.dimensions.filter(
          (value): value is QueryBody['dimensions'][number] =>
            typeof value === 'string' &&
            (ALLOWED_DIMENSIONS as readonly string[]).includes(value)
        )
      : ['query']

    const body: QueryBody = {
      startDate: typeof payload.startDate === 'string' ? payload.startDate : new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10),
      endDate: typeof payload.endDate === 'string' ? payload.endDate : new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      dimensions: dimensions.length > 0 ? dimensions : ['query'],
      rowLimit: numberOrDefault(payload.rowLimit, 100, 1, 25000),
      startRow: numberOrDefault(payload.startRow, 0, 0, 1000000),
      searchType:
        typeof payload.searchType === 'string' &&
        (ALLOWED_SEARCH_TYPES as readonly string[]).includes(payload.searchType)
          ? payload.searchType as QueryBody['searchType']
          : 'web',
      dataState:
        payload.dataState === 'all'
          ? 'all'
          : 'final',
    }

    const data = await querySearchConsoleOAuth(accessToken, siteUrl, body)
    const rows = Array.isArray(data.rows) ? data.rows.length : 0

    const completed = store.updateRun(run.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      output: { request: body, result: data },
    })
    store.appendRunEvent(run.id, identity.userId, {
      level: 'info',
      message: 'Search Console query completed',
      meta: { rows },
    })

    const res = NextResponse.json({
      ok: true,
      run: completed,
    })
    attachSessionCookie(res, identity)
    return res
  } catch (err) {
    store.updateRun(run.id, {
      status: 'failed',
      completedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'Query failed',
    })
    store.appendRunEvent(run.id, identity.userId, {
      level: 'error',
      message: err instanceof Error ? err.message : 'Query failed',
    })
    const res = NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : 'Query failed',
      run: store.getRunForUser(identity.userId, run.id),
    }, { status: 500 })
    attachSessionCookie(res, identity)
    return res
  }
}
