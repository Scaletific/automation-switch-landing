import { NextRequest, NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/gsc/auth'
import { attachSessionCookie, resolveSessionIdentity } from '@/lib/gsc/session'
import { getGscStore } from '@/lib/gsc/store'

export const runtime = 'nodejs'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, context: Params) {
  if (!isFeatureEnabled()) {
    return NextResponse.json({ ok: false, error: 'Feature disabled' }, { status: 404 })
  }

  const identity = resolveSessionIdentity(req)
  const store = getGscStore()
  store.upsertUser(identity.userId)

  const { id } = await context.params
  const run = store.getRunForUser(identity.userId, id)
  if (!run) {
    const res = NextResponse.json({ ok: false, error: 'Run not found' }, { status: 404 })
    attachSessionCookie(res, identity)
    return res
  }

  const res = NextResponse.json({ ok: true, run })
  attachSessionCookie(res, identity)
  return res
}
