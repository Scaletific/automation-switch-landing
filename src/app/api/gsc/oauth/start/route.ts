import { NextRequest, NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/gsc/auth'
import { buildOauthUrl } from '@/lib/gsc/google-client'
import { resolveSessionIdentity, attachSessionCookie } from '@/lib/gsc/session'
import { getGscStore } from '@/lib/gsc/store'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  if (!isFeatureEnabled()) {
    return NextResponse.json({ ok: false, error: 'Feature disabled' }, { status: 404 })
  }

  const identity = resolveSessionIdentity(req)
  const store = getGscStore()
  store.upsertUser(identity.userId)

  const returnTo = req.nextUrl.searchParams.get('returnTo') || '/tools/search-console'
  const loginHint = req.nextUrl.searchParams.get('loginHint') || undefined
  const state = store.createOAuthState(identity.userId, returnTo)
  const authUrl = buildOauthUrl(req, state.state, { loginHint })

  const res = NextResponse.redirect(authUrl)
  attachSessionCookie(res, identity)
  return res
}
