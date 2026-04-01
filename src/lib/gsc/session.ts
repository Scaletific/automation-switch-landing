import { randomUUID } from 'crypto'
import type { NextRequest, NextResponse } from 'next/server'
import { getEnv } from '@/lib/gsc/env'

const SESSION_COOKIE_NAME = 'as_gsc_user'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90

export interface SessionIdentity {
  userId: string
  isNew: boolean
}

export function resolveSessionIdentity(req: NextRequest): SessionIdentity {
  const headerUser = req.headers.get('x-as-user-id')
  if (headerUser) {
    return { userId: headerUser, isNew: false }
  }
  const cookieUser = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (cookieUser) {
    return { userId: cookieUser, isNew: false }
  }
  return { userId: `usr_${randomUUID()}`, isNew: true }
}

export function attachSessionCookie(res: NextResponse, identity: SessionIdentity): void {
  if (!identity.isNew) return
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: identity.userId,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export function resolveBaseUrl(req: NextRequest): string {
  const envBase = getEnv('NEXT_PUBLIC_SITE_URL')
  if (envBase) return envBase.replace(/\/+$/, '')
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const host = req.headers.get('host') ?? 'automationswitch.com'
  return `${proto}://${host}`
}
