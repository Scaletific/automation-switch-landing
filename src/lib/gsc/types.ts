export type GscRunType = 'audit' | 'query' | 'agent'
export type GscRunStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface GscUser {
  id: string
  createdAt: string
}

export interface GscConnection {
  id: string
  userId: string
  provider: 'google'
  providerEmail?: string
  accessToken: string
  refreshToken?: string
  scope?: string
  tokenType?: string
  expiresAt?: number
  createdAt: string
  updatedAt: string
}

export interface GscProperty {
  id: string
  userId: string
  connectionId: string
  siteUrl: string
  permissionLevel: string
  createdAt: string
  updatedAt: string
}

export interface GscRunEvent {
  id: string
  runId: string
  userId: string
  level: 'info' | 'warn' | 'error'
  message: string
  meta?: Record<string, unknown>
  createdAt: string
}

export interface GscRunRecord {
  id: string
  userId: string
  type: GscRunType
  action?: string
  siteUrl?: string
  status: GscRunStatus
  startedAt: string
  completedAt?: string
  error?: string
  input?: Record<string, unknown>
  output?: Record<string, unknown>
}

export interface OAuthStateRecord {
  state: string
  userId: string
  redirectTo: string
  createdAt: string
  expiresAt: string
}
