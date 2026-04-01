import { NextRequest, NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/gsc/auth'
import { getEnv } from '@/lib/gsc/env'
import {
  exchangeCodeForTokens,
  fetchGoogleUserEmail,
  fetchSearchConsoleProperties,
} from '@/lib/gsc/google-client'
import { attachSessionCookie, resolveSessionIdentity } from '@/lib/gsc/session'
import { getGscStore } from '@/lib/gsc/store'

export const runtime = 'nodejs'

function errorRedirect(req: NextRequest, message: string): NextResponse {
  const siteUrl = getEnv('NEXT_PUBLIC_SITE_URL')
  const base = siteUrl
    ? siteUrl.replace(/\/+$/, '')
    : `${req.headers.get('x-forwarded-proto') ?? 'https'}://${req.headers.get('host') ?? 'automationswitch.com'}`
  const url = new URL('/tools/search-console', base)
  url.searchParams.set('oauth', 'error')
  url.searchParams.set('message', message.slice(0, 180))
  return NextResponse.redirect(url)
}

export async function GET(req: NextRequest) {
  if (!isFeatureEnabled()) {
    return NextResponse.json({ ok: false, error: 'Feature disabled' }, { status: 404 })
  }

  const identity = resolveSessionIdentity(req)
  const store = getGscStore()
  store.upsertUser(identity.userId)

  const error = req.nextUrl.searchParams.get('error')
  if (error) {
    const res = errorRedirect(req, `OAuth denied: ${error}`)
    attachSessionCookie(res, identity)
    return res
  }

  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  if (!code || !state) {
    const res = errorRedirect(req, 'Missing code or state in callback')
    attachSessionCookie(res, identity)
    return res
  }

  const stateRecord = store.consumeOAuthState(state, identity.userId)
  if (!stateRecord) {
    const res = errorRedirect(req, 'Invalid or expired OAuth state')
    attachSessionCookie(res, identity)
    return res
  }

  try {
    const tokens = await exchangeCodeForTokens(req, code)
    const providerEmail = await fetchGoogleUserEmail(tokens.access_token)
    const connection = store.saveConnection({
      userId: identity.userId,
      provider: 'google',
      providerEmail,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      scope: tokens.scope,
      tokenType: tokens.token_type,
      expiresAt: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : undefined,
    })

    const props = await fetchSearchConsoleProperties(tokens.access_token)
    store.saveProperties(identity.userId, connection.id, props)

    const finalSite = getEnv('NEXT_PUBLIC_SITE_URL')
    const base = finalSite
      ? finalSite.replace(/\/+$/, '')
      : `${req.headers.get('x-forwarded-proto') ?? 'https'}://${req.headers.get('host') ?? 'automationswitch.com'}`
    const redirectUrl = new URL(stateRecord.redirectTo || '/tools/search-console', base)
    redirectUrl.searchParams.set('oauth', 'success')
    const res = NextResponse.redirect(redirectUrl)
    attachSessionCookie(res, identity)
    return res
  } catch (err) {
    const res = errorRedirect(
      req,
      err instanceof Error ? err.message : 'OAuth callback failed'
    )
    attachSessionCookie(res, identity)
    return res
  }
}
