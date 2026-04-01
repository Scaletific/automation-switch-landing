import { NextRequest, NextResponse } from 'next/server'
import { isFeatureEnabled, parseJsonBody } from '@/lib/gsc/auth'
import { runIndexingBasicsAudit } from '@/lib/gsc/actions'
import { getValidAccessToken } from '@/lib/gsc/google-client'
import { attachSessionCookie, resolveSessionIdentity } from '@/lib/gsc/session'
import { getGscStore } from '@/lib/gsc/store'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!isFeatureEnabled()) {
    return NextResponse.json({ ok: false, error: 'Feature disabled' }, { status: 404 })
  }

  const identity = resolveSessionIdentity(req)
  const store = getGscStore()
  store.upsertUser(identity.userId)

  const payload = parseJsonBody<Record<string, unknown>>(await req.json().catch(() => ({})))
  const siteUrl = typeof payload.siteUrl === 'string' ? payload.siteUrl : ''
  const baseUrl = typeof payload.baseUrl === 'string' ? payload.baseUrl : undefined
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
    type: 'audit',
    siteUrl,
    input: payload,
  })
  store.setRunStatus(run.id, 'running')
  store.appendRunEvent(run.id, identity.userId, {
    level: 'info',
    message: 'Indexing audit started',
  })

  try {
    const { accessToken } = await getValidAccessToken(req, connection)
    const audit = await runIndexingBasicsAudit({ accessToken, siteUrl, baseUrl })
    const completed = store.updateRun(run.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      output: audit as unknown as Record<string, unknown>,
    })
    store.appendRunEvent(run.id, identity.userId, {
      level: audit.status === 'fail' ? 'error' : audit.status === 'warn' ? 'warn' : 'info',
      message: audit.summary,
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
      error: err instanceof Error ? err.message : 'Audit failed',
    })
    store.appendRunEvent(run.id, identity.userId, {
      level: 'error',
      message: err instanceof Error ? err.message : 'Audit failed',
    })
    const res = NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : 'Audit failed',
      run: store.getRunForUser(identity.userId, run.id),
    }, { status: 500 })
    attachSessionCookie(res, identity)
    return res
  }
}
