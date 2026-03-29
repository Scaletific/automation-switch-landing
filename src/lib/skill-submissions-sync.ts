/**
 * skill-submissions-sync.ts
 * Automation Switch — Notion Skill Submissions → Sanity CMS sync library
 *
 * Uses the Notion REST API directly (not the SDK).
 * Notion API version: 2022-06-28
 *
 * Flow:
 *   1. Query Notion Skill Submissions DB for Status = "Approved"
 *   2. Validate required fields (name, url, description)
 *   3. Create skillSource doc in Sanity with status: "pending-review"
 *      — human editorial gate: editor sets featured + publishes in Studio
 *   4. Flip Notion entry Status: Approved → Synced (idempotent)
 *   5. Returns { synced, skipped, errors, duration }
 *
 * Triggered by:
 *   • Vercel Cron — POST /api/sync/skill-submissions (weekly, Mondays 09:00 UTC)
 *   • Manual CLI  — npx tsx --env-file=.env.local scripts/sync-skill-submissions.ts
 *
 * Required env vars:
 *   NOTION_API_TOKEN, NOTION_SUBMISSIONS_DB_ID, SANITY_WRITE_TOKEN
 */

import { createClient } from '@sanity/client'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const NOTION_VERSION = '2022-06-28'
const NOTION_BASE    = 'https://api.notion.com/v1'
const SANITY_PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'l4o4vshf'
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production'

// ─────────────────────────────────────────────────────────────────────────────
// SANITY CLIENT
// ─────────────────────────────────────────────────────────────────────────────

function getSanityWriteClient() {
  if (!process.env.SANITY_WRITE_TOKEN) throw new Error('SANITY_WRITE_TOKEN is not set')
  return createClient({
    projectId: SANITY_PROJECT, dataset: SANITY_DATASET,
    token: process.env.SANITY_WRITE_TOKEN, apiVersion: '2024-01-01', useCdn: false,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTION REST HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function notionHeaders(): Record<string, string> {
  const token = process.env.NOTION_API_TOKEN
  if (!token) throw new Error('NOTION_API_TOKEN is not set')
  return {
    'Authorization':  `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type':   'application/json',
  }
}

async function notionPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${NOTION_BASE}${path}`, {
    method: 'POST', headers: notionHeaders(), body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Notion API error [${res.status}] ${path}: ${err}`)
  }
  return res.json() as Promise<T>
}

async function notionPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${NOTION_BASE}${path}`, {
    method: 'PATCH', headers: notionHeaders(), body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Notion API error [${res.status}] ${path}: ${err}`)
  }
  return res.json() as Promise<T>
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTION TYPES (minimal)
// ─────────────────────────────────────────────────────────────────────────────

interface NotionRichText {
  type:       'text' | 'mention' | 'equation'
  plain_text: string
}

interface NotionPage {
  id:         string
  object:     'page'
  properties: Record<string, NotionProperty>
}

type NotionProperty =
  | { type: 'title';        title:        NotionRichText[] }
  | { type: 'rich_text';    rich_text:    NotionRichText[] }
  | { type: 'url';          url:          string | null }
  | { type: 'select';       select:       { name: string } | null }
  | { type: 'multi_select'; multi_select: { name: string }[] }
  | { type: 'email';        email:        string | null }

interface NotionQueryResponse {
  results:     NotionPage[]
  has_more:    boolean
  next_cursor: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPERTY ACCESSORS
// ─────────────────────────────────────────────────────────────────────────────

function getProp(page: NotionPage, name: string): NotionProperty | undefined {
  return page.properties[name]
}

function getText(page: NotionPage, name: string): string {
  const p = getProp(page, name)
  if (!p) return ''
  if (p.type === 'title')     return p.title.map(t => t.plain_text).join('')
  if (p.type === 'rich_text') return p.rich_text.map(t => t.plain_text).join('')
  if (p.type === 'url')       return p.url ?? ''
  if (p.type === 'email')     return p.email ?? ''
  return ''
}

function getSelect(page: NotionPage, name: string): string {
  const p = getProp(page, name)
  return p?.type === 'select' ? (p.select?.name ?? '') : ''
}

function getMultiSelect(page: NotionPage, name: string): string[] {
  const p = getProp(page, name)
  return p?.type === 'multi_select' ? p.multi_select.map(o => o.name) : []
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTION DB QUERY (paginated)
// ─────────────────────────────────────────────────────────────────────────────

async function queryNotionDB(dbId: string, filter: unknown): Promise<NotionPage[]> {
  const pages: NotionPage[] = []
  let cursor: string | undefined

  do {
    const body: Record<string, unknown> = { filter, page_size: 100 }
    if (cursor) body.start_cursor = cursor
    const response = await notionPost<NotionQueryResponse>(`/databases/${dbId}/query`, body)
    for (const result of response.results) {
      if ('properties' in result) pages.push(result as NotionPage)
    }
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  return pages
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD VALUE MAPS
// Maps Notion multi-select labels → Sanity enum values
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORM_MAP: Record<string, string> = {
  'Claude Code': 'claude-code',
  'Cursor':      'cursor',
  'Copilot':     'copilot',
  'Gemini CLI':  'gemini-cli',
  'Aider':       'aider',
  'Windsurf':    'windsurf',
  'Any':         'generic',
  'Generic':     'generic',
}

const DOMAIN_MAP: Record<string, string> = {
  'Engineering':       'engineering',
  'DevOps':            'devops',
  'Product':           'product',
  'Marketing':         'marketing',
  'Data':              'data',
  'Data / Analytics':  'data',
  'Design':            'design',
  'Finance':           'finance',
  'Legal':             'legal',
  'General':           'general',
}

const SOURCE_TYPE_MAP: Record<string, string> = {
  'Official':      'official',
  'Community':     'community',
  'Tooling':       'tooling',
  'Tooling / CLI': 'tooling',
  'Spec':          'spec',
  'Specification': 'spec',
}

function mapValues(labels: string[], map: Record<string, string>): string[] {
  return labels
    .map(l => map[l] ?? l.toLowerCase().replace(/\s+/g, '-'))
    .filter((v, i, arr) => arr.indexOf(v) === i)
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96)
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULT TYPE
// ─────────────────────────────────────────────────────────────────────────────

export interface SubmissionSyncResult {
  synced:   string[]
  skipped:  { name: string; reason: string }[]
  errors:   { name: string; error: string }[]
  duration: number
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export async function syncSkillSubmissions(): Promise<SubmissionSyncResult> {
  const startTime = Date.now()
  const sanity    = getSanityWriteClient()
  const dbId      = process.env.NOTION_SUBMISSIONS_DB_ID

  if (!dbId) throw new Error('NOTION_SUBMISSIONS_DB_ID is not set')

  const result: SubmissionSyncResult = { synced: [], skipped: [], errors: [], duration: 0 }

  // ── Fetch Approved submissions ────────────────────────────────────────────

  const pages = await queryNotionDB(dbId, {
    property: 'Status',
    select:   { equals: 'Approved' },
  })

  console.log(`[skill-submissions] ${pages.length} Approved submission(s)`)

  for (const page of pages) {
    const name = getText(page, 'Name') || getText(page, 'Source Name') || 'Untitled'

    try {
      const url         = getText(page, 'URL')
      const description = getText(page, 'Description')

      const missing: string[] = []
      if (!name || name === 'Untitled') missing.push('Name')
      if (!url)                         missing.push('URL')
      if (!description)                 missing.push('Description')

      if (missing.length) {
        const reason = `Missing: ${missing.join(', ')}`
        console.warn(`[skill-submissions] SKIP "${name}" — ${reason}`)
        result.skipped.push({ name, reason })
        continue
      }

      const platforms  = mapValues(getMultiSelect(page, 'Platforms'), PLATFORM_MAP)
      const domains    = mapValues(getMultiSelect(page, 'Domains'), DOMAIN_MAP)
      const sourceType = SOURCE_TYPE_MAP[
        getSelect(page, 'Source Type') || getSelect(page, 'Type')
      ] ?? 'community'
      const installCmd = getText(page, 'Install Command') || getText(page, 'Install Cmd')

      const docId = `skill-submission-${page.id.replace(/-/g, '')}`

      const sanityDoc: Record<string, unknown> & { _id: string; _type: string } = {
        _id:   docId,
        _type: 'skillSource',
        name,
        slug:        { _type: 'slug', current: toSlug(name) },
        description: description.slice(0, 300),
        url,
        sourceType,
        status:      'pending-review',
        featured:    false,
        crawlErrors: 0,
        ...(platforms.length && { platforms }),
        ...(domains.length   && { domains }),
        ...(installCmd        && { installCmd }),
      }

      await sanity.createOrReplace(sanityDoc)
      console.log(`[skill-submissions] ✓ "${name}" → ${docId}`)

      await notionPatch(`/pages/${page.id}`, {
        properties: { Status: { select: { name: 'Synced' } } },
      })

      result.synced.push(name)

    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      console.error(`[skill-submissions] ✗ "${name}":`, error)
      result.errors.push({ name, error })
    }
  }

  result.duration = Date.now() - startTime
  console.log(
    `[skill-submissions] Done ${result.duration}ms — ` +
    `✓ ${result.synced.length} · ⊘ ${result.skipped.length} · ✗ ${result.errors.length}`
  )

  return result
}
