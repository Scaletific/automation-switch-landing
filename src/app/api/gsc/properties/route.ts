import { NextRequest, NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/gsc/auth'
import {
  fetchSearchConsoleProperties,
  getValidAccessToken,
} from '@/lib/gsc/google-client'
import { attachSessionCookie, resolveSessionIdentity } from '@/lib/gsc/session'
import { getGscStore } from '@/lib/gsc/store'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  if (!isFeatureEnabled()) {
    return NextResponse.json({ ok: false, error: 'Feature disabled' }, { status: 404 })
  }

  const identity = resolveSessionIdentity(req)
  const store = getGscStore()
  store.upsertUser(identity.userId)

  let connections = store.listConnectionsByUser(identity.userId)
  let properties = store.listPropertiesByUser(identity.userId)

  const shouldRefresh = req.nextUrl.searchParams.get('refresh') === '1'
  if (shouldRefresh && connections.length > 0) {
    const active = connections[0]
    try {
      const { connection, accessToken } = await getValidAccessToken(req, active)
      const remoteProps = await fetchSearchConsoleProperties(accessToken)
      store.saveProperties(identity.userId, connection.id, remoteProps)
      connections = store.listConnectionsByUser(identity.userId)
      properties = store.listPropertiesByUser(identity.userId)
    } catch (err) {
      const res = NextResponse.json({
        ok: false,
        error: err instanceof Error ? err.message : 'Property refresh failed',
        connections,
        properties,
        recentRuns: store.listRunsByUser(identity.userId, 20),
      }, { status: 500 })
      attachSessionCookie(res, identity)
      return res
    }
  }

  const res = NextResponse.json({
    ok: true,
    userId: identity.userId,
    connections: connections.map((c) => ({
      id: c.id,
      provider: c.provider,
      providerEmail: c.providerEmail,
      scope: c.scope,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
    properties,
    recentRuns: store.listRunsByUser(identity.userId, 20),
  })
  attachSessionCookie(res, identity)
  return res
}
