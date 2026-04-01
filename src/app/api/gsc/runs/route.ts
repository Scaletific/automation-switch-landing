import { NextRequest, NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/gsc/auth'
import { attachSessionCookie, resolveSessionIdentity } from '@/lib/gsc/session'
import { getGscStore } from '@/lib/gsc/store'

export const runtime = 'nodejs'

function numberOrDefault(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return fallback
  return Math.max(min, Math.min(max, parsed))
}

export async function GET(req: NextRequest) {
  if (!isFeatureEnabled()) {
    return NextResponse.json({ ok: false, error: 'Feature disabled' }, { status: 404 })
  }

  const identity = resolveSessionIdentity(req)
  const store = getGscStore()
  store.upsertUser(identity.userId)

  const limit = numberOrDefault(req.nextUrl.searchParams.get('limit'), 25, 1, 100)
  const runs = store.listRunsByUser(identity.userId, limit)

  const res = NextResponse.json({ ok: true, runs })
  attachSessionCookie(res, identity)
  return res
}
