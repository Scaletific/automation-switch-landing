import type { NextRequest } from 'next/server'
import { getEnv } from '@/lib/gsc/env'
import { resolveBaseUrl } from '@/lib/gsc/session'
import { getGscStore } from '@/lib/gsc/store'
import type { GscConnection } from '@/lib/gsc/types'

const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const GOOGLE_OAUTH_AUTHORIZE = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_OAUTH_TOKEN = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO = 'https://www.googleapis.com/oauth2/v3/userinfo'
const GSC_SITES_ENDPOINT = 'https://searchconsole.googleapis.com/webmasters/v3/sites'

interface TokenResponse {
  access_token: string
  expires_in?: number
  refresh_token?: string
  scope?: string
  token_type?: string
}

interface UserInfoResponse {
  email?: string
}

interface SitesResponse {
  siteEntry?: Array<{
    siteUrl: string
    permissionLevel: string
  }>
}

function requireEnv(name: string): string {
  const value = getEnv(name)
  if (!value) throw new Error(`${name} is not set`)
  return value
}

function getOauthConfig(req: NextRequest): {
  clientId: string
  clientSecret: string
  redirectUri: string
} {
  const clientId = requireEnv('GOOGLE_OAUTH_CLIENT_ID')
  const clientSecret = requireEnv('GOOGLE_OAUTH_CLIENT_SECRET')
  const configuredRedirect = getEnv('GOOGLE_OAUTH_REDIRECT_URI')
  const redirectUri = configuredRedirect || `${resolveBaseUrl(req)}/api/gsc/oauth/callback`
  return { clientId, clientSecret, redirectUri }
}

export function buildOauthUrl(
  req: NextRequest,
  state: string,
  options?: { loginHint?: string }
): string {
  const { clientId, redirectUri } = getOauthConfig(req)
  const url = new URL(GOOGLE_OAUTH_AUTHORIZE)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', GOOGLE_SCOPE)
  url.searchParams.set('access_type', 'offline')
  // Force account chooser so users can select a non-default Google account.
  // Keep consent to ensure refresh-token grant behavior is consistent.
  url.searchParams.set('prompt', 'select_account consent')
  if (options?.loginHint) {
    url.searchParams.set('login_hint', options.loginHint)
  }
  url.searchParams.set('state', state)
  return url.toString()
}

export async function exchangeCodeForTokens(req: NextRequest, code: string): Promise<TokenResponse> {
  const { clientId, clientSecret, redirectUri } = getOauthConfig(req)
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
  const res = await fetch(GOOGLE_OAUTH_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`Google token exchange failed [${res.status}]: ${msg}`)
  }
  return res.json() as Promise<TokenResponse>
}

async function refreshAccessToken(req: NextRequest, connection: GscConnection): Promise<GscConnection> {
  if (!connection.refreshToken) {
    throw new Error('Refresh token missing; reconnect Google account')
  }
  const { clientId, clientSecret } = getOauthConfig(req)
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: connection.refreshToken,
    grant_type: 'refresh_token',
  })
  const res = await fetch(GOOGLE_OAUTH_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`Google token refresh failed [${res.status}]: ${msg}`)
  }
  const refreshed = await res.json() as TokenResponse
  const store = getGscStore()
  return store.saveConnection({
    userId: connection.userId,
    provider: 'google',
    providerEmail: connection.providerEmail,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token ?? connection.refreshToken,
    scope: refreshed.scope ?? connection.scope,
    tokenType: refreshed.token_type ?? connection.tokenType,
    expiresAt: refreshed.expires_in ? Math.floor(Date.now() / 1000) + refreshed.expires_in : connection.expiresAt,
  })
}

export async function getValidAccessToken(req: NextRequest, connection: GscConnection): Promise<{
  connection: GscConnection
  accessToken: string
}> {
  const expiresAt = connection.expiresAt ?? 0
  const now = Math.floor(Date.now() / 1000)
  if (expiresAt > now + 60) {
    return { connection, accessToken: connection.accessToken }
  }
  const refreshed = await refreshAccessToken(req, connection)
  return { connection: refreshed, accessToken: refreshed.accessToken }
}

export async function fetchGoogleUserEmail(accessToken: string): Promise<string | undefined> {
  const res = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return undefined
  const json = await res.json() as UserInfoResponse
  return json.email
}

export async function fetchSearchConsoleProperties(accessToken: string): Promise<Array<{
  siteUrl: string
  permissionLevel: string
}>> {
  const res = await fetch(GSC_SITES_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`Search Console sites fetch failed [${res.status}]: ${msg}`)
  }
  const json = await res.json() as SitesResponse
  return (json.siteEntry ?? []).map((entry) => ({
    siteUrl: entry.siteUrl,
    permissionLevel: entry.permissionLevel,
  }))
}

export interface QueryBody {
  startDate: string
  endDate: string
  dimensions: string[]
  rowLimit: number
  startRow: number
  searchType: 'web' | 'image' | 'video' | 'news' | 'discover' | 'googleNews'
  dataState: 'final' | 'all'
}

export async function querySearchConsoleOAuth(
  accessToken: string,
  siteUrl: string,
  body: QueryBody
): Promise<Record<string, unknown>> {
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`Search Analytics query failed [${res.status}]: ${msg}`)
  }
  return res.json() as Promise<Record<string, unknown>>
}
