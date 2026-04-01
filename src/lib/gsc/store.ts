import { randomUUID } from 'crypto'
import type {
  GscConnection,
  GscProperty,
  GscRunEvent,
  GscRunRecord,
  GscRunStatus,
  GscRunType,
  GscUser,
  OAuthStateRecord,
} from '@/lib/gsc/types'

// V1 storage is in-memory to unblock dogfooding quickly.
// Swap `getGscStore` with a Postgres-backed adapter for beta/public rollout.
class InMemoryGscStore {
  private users = new Map<string, GscUser>()
  private connections = new Map<string, GscConnection>()
  private properties = new Map<string, GscProperty>()
  private runs = new Map<string, GscRunRecord>()
  private runEvents = new Map<string, GscRunEvent[]>()
  private oauthStates = new Map<string, OAuthStateRecord>()

  upsertUser(userId: string): GscUser {
    const existing = this.users.get(userId)
    if (existing) return existing
    const created: GscUser = { id: userId, createdAt: new Date().toISOString() }
    this.users.set(userId, created)
    return created
  }

  createOAuthState(userId: string, redirectTo: string): OAuthStateRecord {
    const now = new Date()
    const expires = new Date(now.getTime() + 10 * 60 * 1000)
    const record: OAuthStateRecord = {
      state: randomUUID(),
      userId,
      redirectTo,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    }
    this.oauthStates.set(record.state, record)
    return record
  }

  consumeOAuthState(state: string, userId: string): OAuthStateRecord | null {
    const record = this.oauthStates.get(state)
    if (!record) return null
    this.oauthStates.delete(state)
    if (record.userId !== userId) return null
    if (new Date(record.expiresAt).getTime() < Date.now()) return null
    return record
  }

  saveConnection(connection: Omit<GscConnection, 'id' | 'createdAt' | 'updatedAt'>): GscConnection {
    const existing = this.listConnectionsByUser(connection.userId)[0]
    const now = new Date().toISOString()
    const saved: GscConnection = {
      id: existing?.id ?? `conn_${randomUUID()}`,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...connection,
    }
    this.connections.set(saved.id, saved)
    return saved
  }

  getConnectionById(connectionId: string): GscConnection | null {
    return this.connections.get(connectionId) ?? null
  }

  listConnectionsByUser(userId: string): GscConnection[] {
    return Array.from(this.connections.values())
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  saveProperties(userId: string, connectionId: string, rows: Array<{
    siteUrl: string
    permissionLevel: string
  }>): GscProperty[] {
    const now = new Date().toISOString()
    const current = Array.from(this.properties.values()).filter(
      (p) => p.userId === userId && p.connectionId === connectionId
    )
    for (const prop of current) {
      this.properties.delete(prop.id)
    }
    const next = rows.map((row) => {
      const record: GscProperty = {
        id: `prop_${randomUUID()}`,
        userId,
        connectionId,
        siteUrl: row.siteUrl,
        permissionLevel: row.permissionLevel,
        createdAt: now,
        updatedAt: now,
      }
      this.properties.set(record.id, record)
      return record
    })
    return next
  }

  listPropertiesByUser(userId: string): GscProperty[] {
    return Array.from(this.properties.values())
      .filter((p) => p.userId === userId)
      .sort((a, b) => a.siteUrl.localeCompare(b.siteUrl))
  }

  getPropertyForUser(userId: string, siteUrl: string): GscProperty | null {
    return (
      Array.from(this.properties.values()).find(
        (prop) => prop.userId === userId && prop.siteUrl === siteUrl
      ) ?? null
    )
  }

  createRun(args: {
    userId: string
    type: GscRunType
    action?: string
    siteUrl?: string
    input?: Record<string, unknown>
  }): GscRunRecord {
    const run: GscRunRecord = {
      id: `run_${randomUUID()}`,
      userId: args.userId,
      type: args.type,
      action: args.action,
      siteUrl: args.siteUrl,
      status: 'queued',
      startedAt: new Date().toISOString(),
      input: args.input,
    }
    this.runs.set(run.id, run)
    this.runEvents.set(run.id, [])
    return run
  }

  updateRun(runId: string, patch: Partial<Pick<GscRunRecord, 'status' | 'output' | 'error' | 'completedAt'>>): GscRunRecord | null {
    const run = this.runs.get(runId)
    if (!run) return null
    const next = { ...run, ...patch }
    this.runs.set(runId, next)
    return next
  }

  setRunStatus(runId: string, status: GscRunStatus): GscRunRecord | null {
    return this.updateRun(runId, { status })
  }

  appendRunEvent(runId: string, userId: string, event: Omit<GscRunEvent, 'id' | 'runId' | 'userId' | 'createdAt'>): GscRunEvent | null {
    const run = this.runs.get(runId)
    if (!run) return null
    const entry: GscRunEvent = {
      id: `evt_${randomUUID()}`,
      runId,
      userId,
      createdAt: new Date().toISOString(),
      ...event,
    }
    const events = this.runEvents.get(runId) ?? []
    events.push(entry)
    this.runEvents.set(runId, events)
    return entry
  }

  listRunsByUser(userId: string, limit = 25): GscRunRecord[] {
    return Array.from(this.runs.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, limit)
  }

  getRunForUser(userId: string, runId: string): (GscRunRecord & { events: GscRunEvent[] }) | null {
    const run = this.runs.get(runId)
    if (!run || run.userId !== userId) return null
    return { ...run, events: this.runEvents.get(runId) ?? [] }
  }
}

const globalStore = globalThis as typeof globalThis & {
  __asGscStore?: InMemoryGscStore
}

export function getGscStore(): InMemoryGscStore {
  if (!globalStore.__asGscStore) {
    globalStore.__asGscStore = new InMemoryGscStore()
  }
  return globalStore.__asGscStore
}
