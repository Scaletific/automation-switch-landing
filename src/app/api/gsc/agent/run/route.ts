import { NextRequest, NextResponse } from 'next/server'
import {
  findPageImpressionDrops,
  findQueryOpportunities,
  generateActionPlan,
  runIndexingBasicsAudit,
} from '@/lib/gsc/actions'
import { isFeatureEnabled, parseJsonBody } from '@/lib/gsc/auth'
import { getValidAccessToken } from '@/lib/gsc/google-client'
import { attachSessionCookie, resolveSessionIdentity } from '@/lib/gsc/session'
import { getGscStore } from '@/lib/gsc/store'

export const runtime = 'nodejs'

const ALLOWED_ACTIONS = [
  'audit_indexing_basics',
  'find_page_impression_drops',
  'find_query_opportunities',
  'generate_action_plan',
] as const

type AgentAction = typeof ALLOWED_ACTIONS[number]

export async function POST(req: NextRequest) {
  if (!isFeatureEnabled()) {
    return NextResponse.json({ ok: false, error: 'Feature disabled' }, { status: 404 })
  }

  const identity = resolveSessionIdentity(req)
  const store = getGscStore()
  store.upsertUser(identity.userId)

  const payload = parseJsonBody<Record<string, unknown>>(await req.json().catch(() => ({})))
  const siteUrl = typeof payload.siteUrl === 'string' ? payload.siteUrl : ''
  const action = typeof payload.action === 'string' ? payload.action : ''
  const approvalConfirmed = payload.approvalConfirmed === true
  const baseUrl = typeof payload.baseUrl === 'string' ? payload.baseUrl : undefined

  if (!siteUrl) {
    const res = NextResponse.json({ ok: false, error: 'siteUrl is required' }, { status: 400 })
    attachSessionCookie(res, identity)
    return res
  }
  if (!ALLOWED_ACTIONS.includes(action as AgentAction)) {
    const res = NextResponse.json({ ok: false, error: 'Unsupported agent action' }, { status: 400 })
    attachSessionCookie(res, identity)
    return res
  }
  if (!approvalConfirmed) {
    const res = NextResponse.json({ ok: false, error: 'approvalConfirmed must be true' }, { status: 400 })
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
    type: 'agent',
    action,
    siteUrl,
    input: payload,
  })
  store.setRunStatus(run.id, 'running')
  store.appendRunEvent(run.id, identity.userId, {
    level: 'info',
    message: `Agent action started: ${action}`,
  })

  try {
    const { accessToken } = await getValidAccessToken(req, connection)
    let output: Record<string, unknown>
    switch (action as AgentAction) {
      case 'audit_indexing_basics':
        output = await runIndexingBasicsAudit({ accessToken, siteUrl, baseUrl }) as unknown as Record<string, unknown>
        break
      case 'find_page_impression_drops':
        output = await findPageImpressionDrops({ accessToken, siteUrl }) as unknown as Record<string, unknown>
        break
      case 'find_query_opportunities':
        output = await findQueryOpportunities({ accessToken, siteUrl }) as unknown as Record<string, unknown>
        break
      case 'generate_action_plan':
        output = await generateActionPlan({ accessToken, siteUrl, baseUrl }) as unknown as Record<string, unknown>
        break
      default:
        output = { message: 'No action executed' }
        break
    }

    const completed = store.updateRun(run.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      output,
    })
    store.appendRunEvent(run.id, identity.userId, {
      level: 'info',
      message: `Agent action completed: ${action}`,
    })

    const res = NextResponse.json({ ok: true, run: completed })
    attachSessionCookie(res, identity)
    return res
  } catch (err) {
    store.updateRun(run.id, {
      status: 'failed',
      completedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'Agent action failed',
    })
    store.appendRunEvent(run.id, identity.userId, {
      level: 'error',
      message: err instanceof Error ? err.message : 'Agent action failed',
    })
    const res = NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : 'Agent action failed',
      run: store.getRunForUser(identity.userId, run.id),
    }, { status: 500 })
    attachSessionCookie(res, identity)
    return res
  }
}
