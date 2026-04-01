'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type RunStatus = 'queued' | 'running' | 'completed' | 'failed'
type RunType = 'audit' | 'query' | 'agent'
type AgentAction =
  | 'audit_indexing_basics'
  | 'find_page_impression_drops'
  | 'find_query_opportunities'
  | 'generate_action_plan'

interface Connection {
  id: string
  provider: 'google'
  providerEmail?: string
  createdAt: string
  updatedAt: string
}

interface Property {
  id: string
  siteUrl: string
  permissionLevel: string
}

interface RunRecord {
  id: string
  type: RunType
  action?: string
  siteUrl?: string
  status: RunStatus
  startedAt: string
  completedAt?: string
  error?: string
  output?: Record<string, unknown>
}

interface RunDetail extends RunRecord {
  events?: Array<{
    id: string
    level: 'info' | 'warn' | 'error'
    message: string
    createdAt: string
  }>
}

const AGENT_ACTIONS: Array<{
  action: AgentAction
  title: string
  description: string
}> = [
  {
    action: 'audit_indexing_basics',
    title: 'Audit Indexing Basics',
    description: 'Validate robots.txt, sitemap.xml, and Search Console data availability.',
  },
  {
    action: 'find_page_impression_drops',
    title: 'Find Page Impression Drops',
    description: 'Compare recent vs baseline periods and detect pages losing impressions.',
  },
  {
    action: 'find_query_opportunities',
    title: 'Find Query Opportunities',
    description: 'Surface high-impression, low-CTR queries for title/meta improvements.',
  },
  {
    action: 'generate_action_plan',
    title: 'Generate Action Plan',
    description: 'Combine audit and signal checks into a prioritized next-step plan.',
  },
]

function statusClass(status: RunStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300'
    case 'running':
      return 'bg-sky-100 text-sky-900 border-sky-300'
    case 'queued':
      return 'bg-amber-100 text-amber-900 border-amber-300'
    case 'failed':
      return 'bg-rose-100 text-rose-900 border-rose-300'
    default:
      return 'bg-slate-100 text-slate-900 border-slate-300'
  }
}

function prettyDate(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function summarizeOutput(run?: RunRecord): string {
  if (!run?.output) return run?.error ?? 'No output'
  if (run.type === 'audit') {
    const summary = run.output.summary
    if (typeof summary === 'string') return summary
  }
  if (run.type === 'agent' && run.action === 'generate_action_plan') {
    const signals = run.output.signals
    if (signals && typeof signals === 'object') {
      const values = signals as Record<string, unknown>
      const drops = values.dropsFound
      const opps = values.opportunitiesFound
      if (typeof drops === 'number' && typeof opps === 'number') {
        return `Signals: ${drops} drops, ${opps} opportunities`
      }
    }
  }
  return 'Completed'
}

export default function SearchConsoleCopilot() {
  const [oauthState, setOauthState] = useState<string | null>(null)
  const [oauthMessage, setOauthMessage] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [connections, setConnections] = useState<Connection[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [runs, setRuns] = useState<RunRecord[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [selectedRun, setSelectedRun] = useState<RunDetail | null>(null)

  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - 8)
    return d.toISOString().slice(0, 10)
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - 1)
    return d.toISOString().slice(0, 10)
  })
  const [dimensions, setDimensions] = useState<string>('query,page')
  const [rowLimit, setRowLimit] = useState<number>(100)

  const [pendingAction, setPendingAction] = useState<AgentAction | null>(null)
  const [loginHint, setLoginHint] = useState<string>('')

  const hasConnection = connections.length > 0

  const loadDashboard = useCallback(async (refresh = false) => {
    setLoading(true)
    setError(null)
    try {
      const params = refresh ? '?refresh=1' : ''
      const res = await fetch(`/api/gsc/properties${params}`, { cache: 'no-store' })
      const json = await res.json() as {
        ok: boolean
        error?: string
        connections?: Connection[]
        properties?: Property[]
        recentRuns?: RunRecord[]
      }
      if (!json.ok) throw new Error(json.error || 'Failed to load dashboard')
      const nextConnections = json.connections ?? []
      const nextProperties = json.properties ?? []
      const nextRuns = json.recentRuns ?? []
      setConnections(nextConnections)
      setProperties(nextProperties)
      setRuns(nextRuns)
      if (!selectedProperty && nextProperties.length > 0) {
        setSelectedProperty(nextProperties[0].siteUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [selectedProperty])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setOauthState(params.get('oauth'))
    setOauthMessage(params.get('message'))
  }, [])

  useEffect(() => {
    void loadDashboard(false)
  }, [loadDashboard])

  const refreshRun = useCallback(async (runId: string) => {
    try {
      const res = await fetch(`/api/gsc/runs/${runId}`, { cache: 'no-store' })
      const json = await res.json() as { ok: boolean; run?: RunDetail; error?: string }
      if (!json.ok || !json.run) throw new Error(json.error || 'Failed to load run')
      setSelectedRun(json.run)
      setRuns((prev) => {
        const next = prev.filter((run) => run.id !== json.run!.id)
        next.unshift(json.run!)
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load run')
    }
  }, [])

  const execute = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setBusy(false)
    }
  }, [])

  const runQuery = useCallback(async () => {
    if (!selectedProperty) {
      setError('Select a property first')
      return
    }
    await execute(async () => {
      const res = await fetch('/api/gsc/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: selectedProperty,
          startDate,
          endDate,
          dimensions: dimensions.split(',').map((item) => item.trim()).filter(Boolean),
          rowLimit,
          searchType: 'web',
          dataState: 'final',
        }),
      })
      const json = await res.json() as { ok: boolean; run?: RunRecord; error?: string }
      if (!json.ok || !json.run) throw new Error(json.error || 'Query failed')
      setRuns((prev) => [json.run!, ...prev.filter((run) => run.id !== json.run!.id)])
      await refreshRun(json.run.id)
    })
  }, [dimensions, endDate, execute, refreshRun, rowLimit, selectedProperty, startDate])

  const runAudit = useCallback(async () => {
    if (!selectedProperty) {
      setError('Select a property first')
      return
    }
    await execute(async () => {
      const res = await fetch('/api/gsc/audit/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: selectedProperty,
        }),
      })
      const json = await res.json() as { ok: boolean; run?: RunRecord; error?: string }
      if (!json.ok || !json.run) throw new Error(json.error || 'Audit failed')
      setRuns((prev) => [json.run!, ...prev.filter((run) => run.id !== json.run!.id)])
      await refreshRun(json.run.id)
    })
  }, [execute, refreshRun, selectedProperty])

  const runAgentAction = useCallback(async (action: AgentAction) => {
    if (!selectedProperty) {
      setError('Select a property first')
      return
    }
    await execute(async () => {
      const res = await fetch('/api/gsc/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: selectedProperty,
          action,
          approvalConfirmed: true,
        }),
      })
      const json = await res.json() as { ok: boolean; run?: RunRecord; error?: string }
      if (!json.ok || !json.run) throw new Error(json.error || 'Agent run failed')
      setRuns((prev) => [json.run!, ...prev.filter((run) => run.id !== json.run!.id)])
      await refreshRun(json.run.id)
      setPendingAction(null)
    })
  }, [execute, refreshRun, selectedProperty])

  const runRows = useMemo(() => runs.slice(0, 12), [runs])

  return (
    <div className="mx-auto mb-24 mt-8 max-w-6xl px-6 pb-10">
      <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-6">
        <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--amber)]">Beta Tool</div>
        <h1 className="mt-2 font-display text-5xl tracking-[0.04em] text-[var(--text)]">SEARCH CONSOLE COPILOT</h1>
        <p className="mt-4 max-w-3xl text-sm text-[var(--text-mid)]">
          Connect a Google Search Console property, run indexing audits, query performance data,
          and use agent actions for prioritized SEO next steps. Read-only by default.
        </p>
        {oauthState === 'success' && (
          <div className="mt-4 rounded-md border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm text-emerald-900">
            Google account connected successfully.
          </div>
        )}
        {oauthState === 'error' && (
          <div className="mt-4 rounded-md border border-rose-300 bg-rose-100 px-3 py-2 text-sm text-rose-900">
            OAuth failed{oauthMessage ? `: ${oauthMessage}` : '.'}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-md border border-rose-300 bg-rose-100 px-3 py-2 text-sm text-rose-900">
            {error}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-dim)]">Connect</h2>
              <button
                onClick={() => void loadDashboard(true)}
                disabled={loading || busy}
                className="rounded border border-[var(--border)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-mid)] hover:bg-[var(--bg3)] disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
            {!hasConnection ? (
              <div className="space-y-3">
                <label className="block text-xs text-[var(--text-mid)]">
                  Account email hint (optional)
                  <input
                    type="email"
                    value={loginHint}
                    onChange={(event) => setLoginHint(event.target.value)}
                    placeholder="you@yourdomain.com"
                    className="mt-1 w-full rounded border border-[var(--border-soft)] bg-white px-2 py-1 text-sm text-[var(--text)]"
                  />
                </label>
                <button
                  disabled={busy}
                  onClick={() => {
                    const params = new URLSearchParams()
                    params.set('returnTo', '/tools/search-console')
                    if (loginHint.trim()) {
                      params.set('loginHint', loginHint.trim())
                    }
                    window.location.href = `/api/gsc/oauth/start?${params.toString()}`
                  }}
                  className="rounded bg-[var(--amber)] px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-white hover:bg-[var(--amber-dark)] disabled:opacity-60"
                >
                  Connect Google Search Console
                </button>
                <p className="text-xs text-[var(--text-dim)]">
                  Account chooser is now forced on every connect attempt so you can pick the correct Google identity.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {connections.map((connection) => (
                  <div key={connection.id} className="rounded border border-[var(--border-soft)] bg-white px-3 py-2 text-sm">
                    <div className="font-semibold text-[var(--text)]">Google Connection</div>
                    <div className="text-[var(--text-mid)]">
                      {connection.providerEmail || 'Connected account'} · Updated {prettyDate(connection.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-5">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-dim)]">Property</h2>
            <select
              value={selectedProperty}
              onChange={(event) => setSelectedProperty(event.target.value)}
              className="w-full rounded border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--text)]"
            >
              <option value="">Select a property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.siteUrl}>
                  {property.siteUrl} ({property.permissionLevel})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-5">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-dim)]">Query</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-[var(--text-mid)]">
                Start date
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-1 w-full rounded border border-[var(--border-soft)] bg-white px-2 py-1 text-sm text-[var(--text)]"
                />
              </label>
              <label className="text-xs text-[var(--text-mid)]">
                End date
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-1 w-full rounded border border-[var(--border-soft)] bg-white px-2 py-1 text-sm text-[var(--text)]"
                />
              </label>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-[var(--text-mid)]">
                Dimensions (comma-separated)
                <input
                  value={dimensions}
                  onChange={(event) => setDimensions(event.target.value)}
                  className="mt-1 w-full rounded border border-[var(--border-soft)] bg-white px-2 py-1 text-sm text-[var(--text)]"
                />
              </label>
              <label className="text-xs text-[var(--text-mid)]">
                Row limit
                <input
                  type="number"
                  min={1}
                  max={25000}
                  value={rowLimit}
                  onChange={(event) => setRowLimit(Number(event.target.value) || 100)}
                  className="mt-1 w-full rounded border border-[var(--border-soft)] bg-white px-2 py-1 text-sm text-[var(--text)]"
                />
              </label>
            </div>
            <button
              disabled={busy || !selectedProperty}
              onClick={() => void runQuery()}
              className="mt-4 rounded bg-[var(--amber)] px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-white hover:bg-[var(--amber-dark)] disabled:opacity-60"
            >
              Run Query
            </button>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-5">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-dim)]">Audit</h2>
            <p className="text-sm text-[var(--text-mid)]">
              Runs robots/sitemap accessibility checks plus Search Console data availability.
            </p>
            <button
              disabled={busy || !selectedProperty}
              onClick={() => void runAudit()}
              className="mt-4 rounded bg-[var(--amber)] px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-white hover:bg-[var(--amber-dark)] disabled:opacity-60"
            >
              Run Indexing Audit
            </button>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-5">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-dim)]">Agent Actions</h2>
            <div className="space-y-3">
              {AGENT_ACTIONS.map((action) => (
                <div key={action.action} className="rounded border border-[var(--border-soft)] bg-white p-3">
                  <div className="font-semibold text-[var(--text)]">{action.title}</div>
                  <p className="mt-1 text-sm text-[var(--text-mid)]">{action.description}</p>
                  <button
                    disabled={busy || !selectedProperty}
                    onClick={() => setPendingAction(action.action)}
                    className="mt-3 rounded border border-[var(--border)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--text-mid)] hover:bg-[var(--bg3)] disabled:opacity-60"
                  >
                    Run Action
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-5">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-dim)]">History</h2>
            {loading ? (
              <p className="text-sm text-[var(--text-mid)]">Loading…</p>
            ) : runRows.length === 0 ? (
              <p className="text-sm text-[var(--text-mid)]">No runs yet.</p>
            ) : (
              <div className="space-y-2">
                {runRows.map((run) => (
                  <button
                    key={run.id}
                    onClick={() => void refreshRun(run.id)}
                    className="w-full rounded border border-[var(--border-soft)] bg-white p-3 text-left hover:bg-[var(--bg3)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--text-dim)]">
                        {run.type}{run.action ? ` · ${run.action}` : ''}
                      </div>
                      <span className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${statusClass(run.status)}`}>
                        {run.status}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-mid)]">{run.siteUrl || '—'}</div>
                    <div className="mt-1 text-xs text-[var(--text-mid)]">{summarizeOutput(run)}</div>
                    <div className="mt-1 text-[11px] text-[var(--text-dim)]">{prettyDate(run.startedAt)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-5">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-dim)]">Run Detail</h2>
            {!selectedRun ? (
              <p className="text-sm text-[var(--text-mid)]">Select a run from history to inspect output.</p>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold text-[var(--text)]">
                    {selectedRun.type}{selectedRun.action ? ` · ${selectedRun.action}` : ''}
                  </div>
                  <div className="text-xs text-[var(--text-mid)]">{selectedRun.siteUrl || '—'}</div>
                </div>

                {selectedRun.type === 'query' && Boolean(selectedRun.output?.result) && typeof selectedRun.output?.result === 'object' && (
                  <QueryTable output={selectedRun.output.result as Record<string, unknown>} />
                )}

                {selectedRun.type === 'audit' && Boolean(selectedRun.output?.checks) && Array.isArray(selectedRun.output?.checks) && (
                  <AuditChecks checks={selectedRun.output.checks as Array<Record<string, unknown>>} />
                )}

                {selectedRun.type === 'agent' && (
                  <AgentOutput output={selectedRun.output} />
                )}

                <details>
                  <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--text-dim)]">
                    Raw JSON
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto rounded bg-white p-2 text-[11px] text-[var(--text)]">
                    {JSON.stringify(selectedRun.output ?? {}, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </aside>
      </div>

      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-xl rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-6 shadow-xl">
            <div className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--amber)]">Approval Required</div>
            <h3 className="mt-2 text-lg font-semibold text-[var(--text)]">Confirm Agent Action</h3>
            <p className="mt-2 text-sm text-[var(--text-mid)]">
              You are about to run <strong>{pendingAction}</strong> on <strong>{selectedProperty || 'no property selected'}</strong>.
              This action is read-only and will be logged in run history.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setPendingAction(null)}
                className="rounded border border-[var(--border)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--text-mid)] hover:bg-[var(--bg3)]"
              >
                Cancel
              </button>
              <button
                disabled={busy || !selectedProperty}
                onClick={() => void runAgentAction(pendingAction)}
                className="rounded bg-[var(--amber)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-white hover:bg-[var(--amber-dark)] disabled:opacity-60"
              >
                Approve & Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function QueryTable({ output }: { output: Record<string, unknown> }) {
  const rows = Array.isArray(output.rows) ? output.rows : []
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--text-mid)]">No query rows returned.</p>
  }
  return (
    <div className="overflow-x-auto rounded border border-[var(--border-soft)] bg-white">
      <table className="min-w-full text-xs">
        <thead className="bg-[var(--bg3)] text-[var(--text-mid)]">
          <tr>
            <th className="px-2 py-1 text-left">Keys</th>
            <th className="px-2 py-1 text-right">Clicks</th>
            <th className="px-2 py-1 text-right">Impr.</th>
            <th className="px-2 py-1 text-right">CTR</th>
            <th className="px-2 py-1 text-right">Pos.</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 20).map((row, idx) => {
            const item = row as Record<string, unknown>
            const keys = Array.isArray(item.keys) ? item.keys.join(' | ') : '—'
            const clicks = typeof item.clicks === 'number' ? item.clicks.toLocaleString() : '—'
            const impressions = typeof item.impressions === 'number' ? item.impressions.toLocaleString() : '—'
            const ctr = typeof item.ctr === 'number' ? `${(item.ctr * 100).toFixed(2)}%` : '—'
            const pos = typeof item.position === 'number' ? item.position.toFixed(1) : '—'
            return (
              <tr key={idx} className="border-t border-[var(--border-soft)] text-[var(--text)]">
                <td className="px-2 py-1">{keys}</td>
                <td className="px-2 py-1 text-right">{clicks}</td>
                <td className="px-2 py-1 text-right">{impressions}</td>
                <td className="px-2 py-1 text-right">{ctr}</td>
                <td className="px-2 py-1 text-right">{pos}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function AuditChecks({ checks }: { checks: Array<Record<string, unknown>> }) {
  if (checks.length === 0) return <p className="text-sm text-[var(--text-mid)]">No audit checks found.</p>
  return (
    <div className="space-y-2">
      {checks.map((check, idx) => {
        const name = typeof check.name === 'string' ? check.name : `check-${idx + 1}`
        const state = typeof check.state === 'string' ? check.state : 'info'
        const details = typeof check.details === 'string' ? check.details : 'No details'
        const color =
          state === 'pass'
            ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
            : state === 'warn'
              ? 'border-amber-300 bg-amber-100 text-amber-900'
              : 'border-rose-300 bg-rose-100 text-rose-900'
        return (
          <div key={idx} className={`rounded border px-3 py-2 text-xs ${color}`}>
            <div className="font-semibold uppercase tracking-[0.08em]">{name}</div>
            <div>{details}</div>
          </div>
        )
      })}
    </div>
  )
}

function AgentOutput({ output }: { output?: Record<string, unknown> }) {
  if (!output) {
    return <p className="text-sm text-[var(--text-mid)]">No agent output.</p>
  }
  if (Array.isArray(output.recommendations)) {
    return (
      <div className="space-y-2">
        <div className="font-semibold text-[var(--text)]">Recommendations</div>
        <ul className="list-disc space-y-1 pl-4 text-sm text-[var(--text-mid)]">
          {output.recommendations.map((item, idx) => (
            <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
          ))}
        </ul>
      </div>
    )
  }
  if (Array.isArray(output.drops)) {
    const drops = output.drops as Array<Record<string, unknown>>
    return (
      <div className="space-y-2">
        <div className="font-semibold text-[var(--text)]">Largest Impression Drops</div>
        <div className="overflow-x-auto rounded border border-[var(--border-soft)] bg-white">
          <table className="min-w-full text-xs">
            <thead className="bg-[var(--bg3)] text-[var(--text-mid)]">
              <tr>
                <th className="px-2 py-1 text-left">Page</th>
                <th className="px-2 py-1 text-right">Current</th>
                <th className="px-2 py-1 text-right">Previous</th>
                <th className="px-2 py-1 text-right">Delta</th>
                <th className="px-2 py-1 text-right">Delta %</th>
              </tr>
            </thead>
            <tbody>
              {drops.slice(0, 10).map((drop, idx) => (
                <tr key={idx} className="border-t border-[var(--border-soft)] text-[var(--text)]">
                  <td className="px-2 py-1">{String(drop.page ?? 'Unknown page')}</td>
                  <td className="px-2 py-1 text-right">{typeof drop.currentImpressions === 'number' ? drop.currentImpressions.toLocaleString() : '—'}</td>
                  <td className="px-2 py-1 text-right">{typeof drop.previousImpressions === 'number' ? drop.previousImpressions.toLocaleString() : '—'}</td>
                  <td className="px-2 py-1 text-right">{typeof drop.delta === 'number' ? drop.delta.toLocaleString() : '—'}</td>
                  <td className="px-2 py-1 text-right">{typeof drop.deltaPct === 'number' ? `${drop.deltaPct.toFixed(1)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  if (Array.isArray(output.opportunities)) {
    const opportunities = output.opportunities as Array<Record<string, unknown>>
    return (
      <div className="space-y-2">
        <div className="font-semibold text-[var(--text)]">Query Opportunities</div>
        <div className="overflow-x-auto rounded border border-[var(--border-soft)] bg-white">
          <table className="min-w-full text-xs">
            <thead className="bg-[var(--bg3)] text-[var(--text-mid)]">
              <tr>
                <th className="px-2 py-1 text-left">Query</th>
                <th className="px-2 py-1 text-right">Impr.</th>
                <th className="px-2 py-1 text-right">Clicks</th>
                <th className="px-2 py-1 text-right">CTR</th>
                <th className="px-2 py-1 text-right">Pos.</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.slice(0, 10).map((item, idx) => (
                <tr key={idx} className="border-t border-[var(--border-soft)] text-[var(--text)]">
                  <td className="px-2 py-1">{String(item.query ?? 'Unknown query')}</td>
                  <td className="px-2 py-1 text-right">{typeof item.impressions === 'number' ? item.impressions.toLocaleString() : '—'}</td>
                  <td className="px-2 py-1 text-right">{typeof item.clicks === 'number' ? item.clicks.toLocaleString() : '—'}</td>
                  <td className="px-2 py-1 text-right">{typeof item.ctr === 'number' ? `${(item.ctr * 100).toFixed(2)}%` : '—'}</td>
                  <td className="px-2 py-1 text-right">{typeof item.position === 'number' ? item.position.toFixed(1) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  return <p className="text-sm text-[var(--text-mid)]">Agent action completed.</p>
}
