import type { NextRequest } from 'next/server'
import { getEnv } from '@/lib/gsc/env'

export function isSyncAuthorised(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${getEnv('CRON_SECRET')}`) return true

  const manualSecret =
    req.headers.get('x-sync-secret') ??
    req.nextUrl.searchParams.get('secret')

  return Boolean(manualSecret && manualSecret === getEnv('SYNC_SECRET'))
}

export function parseJsonBody<T extends Record<string, unknown>>(
  raw: unknown
): T {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as T
  }
  return {} as T
}

export function isFeatureEnabled(): boolean {
  if (getEnv('GSC_FEATURE_ENABLED') === 'false') return false
  return true
}
