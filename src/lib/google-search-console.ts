import { createSign } from 'crypto'

const GOOGLE_OAUTH_TOKEN_URI = process.env.GOOGLE_OAUTH_TOKEN_URI ?? 'https://oauth2.googleapis.com/token'
const GOOGLE_SCOPE_READONLY  = 'https://www.googleapis.com/auth/webmasters.readonly'
const SEARCH_CONSOLE_BASE    = 'https://searchconsole.googleapis.com/webmasters/v3'

let cachedToken: { token: string; expiresAt: number } | null = null

export type SearchAnalyticsDimension =
  | 'date'
  | 'query'
  | 'page'
  | 'country'
  | 'device'
  | 'searchAppearance'

export interface SearchAnalyticsRow {
  keys?: string[]
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
}

export interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[]
  responseAggregationType?: string
}

export interface SearchAnalyticsQuery {
  startDate: string
  endDate: string
  dimensions?: SearchAnalyticsDimension[]
  rowLimit?: number
  startRow?: number
  searchType?: 'web' | 'image' | 'video' | 'news' | 'discover' | 'googleNews'
  dataState?: 'final' | 'all'
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

function base64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function getPrivateKey(): string {
  const fromBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64
  if (fromBase64) {
    return Buffer.from(fromBase64, 'base64').toString('utf8')
  }

  const raw = requiredEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
  return raw.replace(/\\n/g, '\n')
}

async function fetchAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expiresAt - 60 > now) {
    return cachedToken.token
  }

  const clientEmail = requiredEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL')
  const privateKey  = getPrivateKey()

  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss:   clientEmail,
    scope: GOOGLE_SCOPE_READONLY,
    aud:   GOOGLE_OAUTH_TOKEN_URI,
    iat:   now,
    exp:   now + 3600,
  }

  const encodedHeader  = base64Url(JSON.stringify(header))
  const encodedPayload = base64Url(JSON.stringify(payload))
  const unsignedJwt    = `${encodedHeader}.${encodedPayload}`

  const signer = createSign('RSA-SHA256')
  signer.update(unsignedJwt)
  const signature = base64Url(signer.sign(privateKey))
  const jwt       = `${unsignedJwt}.${signature}`

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  })

  const tokenRes = await fetch(GOOGLE_OAUTH_TOKEN_URI, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text()
    throw new Error(`Google OAuth token request failed [${tokenRes.status}]: ${errorBody}`)
  }

  const tokenJson = await tokenRes.json() as { access_token?: string; expires_in?: number }
  if (!tokenJson.access_token) {
    throw new Error('Google OAuth token response did not include access_token')
  }

  const expiresIn = tokenJson.expires_in ?? 3600
  cachedToken = {
    token: tokenJson.access_token,
    expiresAt: now + expiresIn,
  }

  return tokenJson.access_token
}

export function defaultDateRange(days = 7): { startDate: string; endDate: string } {
  const end = new Date()
  end.setUTCDate(end.getUTCDate() - 1)

  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - Math.max(days - 1, 0))

  const toIsoDate = (d: Date) => d.toISOString().slice(0, 10)
  return {
    startDate: toIsoDate(start),
    endDate:   toIsoDate(end),
  }
}

export async function querySearchConsole(
  siteUrl: string,
  query: SearchAnalyticsQuery
): Promise<SearchAnalyticsResponse> {
  const token = await fetchAccessToken()
  const endpoint = `${SEARCH_CONSOLE_BASE}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      startDate:  query.startDate,
      endDate:    query.endDate,
      dimensions: query.dimensions ?? ['query'],
      rowLimit:   query.rowLimit ?? 25,
      startRow:   query.startRow ?? 0,
      searchType: query.searchType ?? 'web',
      dataState:  query.dataState ?? 'final',
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Search Console query failed [${response.status}]: ${errorBody}`)
  }

  return response.json() as Promise<SearchAnalyticsResponse>
}
