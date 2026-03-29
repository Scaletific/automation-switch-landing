/**
 * skills-sync.ts
 * Automation Switch — Firecrawl/GitHub skill count updater library
 *
 * Three strategies, auto-selected by source URL:
 *
 *   github    — GitHub Trees API. Free. 5,000 req/hr with GITHUB_TOKEN, 60/hr without.
 *               Counts files matching /skill\.md$/i in the full repo tree.
 *
 *   npm       — Resolves npm package → GitHub repo via npm registry, then falls
 *               through to the github strategy. Falls back to firecrawl if no
 *               GitHub link is found in the package metadata.
 *
 *   firecrawl — Firecrawl /v1/map for everything else (aggregator sites like
 *               agentskills.so, docs sites, etc.). Counts skill-shaped URL paths
 *               first (/skills/commit, /skill/review-pr, etc.), then falls back
 *               to counting /skill.md path matches.
 *
 * Triggered by:
 *   • Vercel Cron — POST /api/sync/skills (weekly, Mondays 10:00 UTC)
 *   • Manual CLI  — npx tsx --env-file=.env.local scripts/sync-skills.ts
 *
 * Required env vars:
 *   SANITY_API_TOKEN, SANITY_WRITE_TOKEN, FIRECRAWL_API_KEY
 * Optional:
 *   GITHUB_TOKEN — raises GitHub rate limit from 60 → 5,000 req/hr
 */

import { createClient } from '@sanity/client'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const FIRECRAWL_BASE  = 'https://api.firecrawl.dev/v1'
const GITHUB_API_BASE = 'https://api.github.com'
const NPM_REGISTRY    = 'https://registry.npmjs.org'
const SANITY_PROJECT  = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'l4o4vshf'
const SANITY_DATASET  = process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production'

const CRAWL_ERROR_THRESHOLD = 3
const MAP_URL_LIMIT         = 5000

// ─────────────────────────────────────────────────────────────────────────────
// SANITY CLIENTS
// ─────────────────────────────────────────────────────────────────────────────

function getSanityReadClient() {
  if (!process.env.SANITY_API_TOKEN) throw new Error('SANITY_API_TOKEN is not set')
  return createClient({
    projectId: SANITY_PROJECT, dataset: SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN, apiVersion: '2024-01-01', useCdn: false,
  })
}

function getSanityWriteClient() {
  if (!process.env.SANITY_WRITE_TOKEN) throw new Error('SANITY_WRITE_TOKEN is not set')
  return createClient({
    projectId: SANITY_PROJECT, dataset: SANITY_DATASET,
    token: process.env.SANITY_WRITE_TOKEN, apiVersion: '2024-01-01', useCdn: false,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type CountStrategy = 'github' | 'npm' | 'firecrawl'

interface SkillSourceDoc {
  _id:         string
  name:        string
  url:         string
  skillCount:  number | null
  crawlErrors: number | null
}

export interface SkillCountResult {
  docId:     string
  name:      string
  strategy:  CountStrategy
  newCount:  number | null
  prevCount: number | null
  changed:   boolean
  error?:    string
}

export interface SkillsSyncResult {
  updated:   SkillCountResult[]
  unchanged: SkillCountResult[]
  failed:    SkillCountResult[]
  duration:  number
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY ROUTER
// ─────────────────────────────────────────────────────────────────────────────

function getStrategy(url: string): CountStrategy {
  if (/^https?:\/\/(www\.)?github\.com\//i.test(url))          return 'github'
  if (/^https?:\/\/(www\.)?npmjs\.com\/package\//i.test(url))  return 'npm'
  return 'firecrawl'
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 1 — GITHUB
// ─────────────────────────────────────────────────────────────────────────────

interface GitHubTreeItem     { path: string; type: 'blob' | 'tree' }
interface GitHubTreeResponse { tree: GitHubTreeItem[]; truncated: boolean }

function githubHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    'Accept':               'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) h['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  return h
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
}

async function countViaGitHub(url: string): Promise<number> {
  const parsed = parseGitHubUrl(url)
  if (!parsed) throw new Error(`Cannot parse GitHub URL: ${url}`)
  const { owner, repo } = parsed

  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers: githubHeaders(), signal: AbortSignal.timeout(30_000) },
  )

  if (res.status === 404) throw new Error(`GitHub repo not found: ${owner}/${repo}`)
  if (res.status === 403) throw new Error(
    `GitHub rate limit hit for ${owner}/${repo} — add GITHUB_TOKEN to .env.local`
  )
  if (!res.ok) throw new Error(`GitHub API [${res.status}]: ${owner}/${repo}`)

  const data = await res.json() as GitHubTreeResponse

  if (data.truncated) {
    console.warn(`[skills-sync] ⚠️  ${owner}/${repo} tree truncated — count may be partial`)
  }

  return data.tree.filter(
    item => item.type === 'blob' && /(?:^|\/)skill\.md$/i.test(item.path)
  ).length
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 2 — NPM → GITHUB
// ─────────────────────────────────────────────────────────────────────────────

interface NpmPackageResponse {
  repository?: { url?: string; type?: string }
}

async function resolveNpmToGitHub(url: string): Promise<string | null> {
  const match = url.match(/npmjs\.com\/package\/(@?[^\/\?#]+(?:\/[^\/\?#]+)?)/)
  if (!match) return null

  const pkgName = decodeURIComponent(match[1])
  const res = await fetch(`${NPM_REGISTRY}/${pkgName}`, {
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) return null

  const data = await res.json() as NpmPackageResponse
  const repoUrl = data.repository?.url ?? ''

  const githubMatch = repoUrl.match(/github\.com[\/:]([^\/]+\/[^\/\.]+)/)
  if (!githubMatch) return null

  return `https://github.com/${githubMatch[1].replace(/\.git$/, '')}`
}

async function countViaNpm(url: string): Promise<number> {
  const githubUrl = await resolveNpmToGitHub(url)
  if (githubUrl) {
    console.log(`[skills-sync]   npm → resolved to ${githubUrl}`)
    return countViaGitHub(githubUrl)
  }
  console.warn(`[skills-sync]   npm → no GitHub link found, falling back to Firecrawl`)
  return countViaFirecrawl(url)
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 3 — FIRECRAWL
// ─────────────────────────────────────────────────────────────────────────────

const SKILL_PAGE_PATTERNS: RegExp[] = [
  /\/skills?\/[a-z0-9][a-z0-9_-]{1,}\/?$/i,
  /\/s\/[a-z0-9][a-z0-9_-]{1,}\/?$/i,
  /\/commands?\/[a-z0-9][a-z0-9_-]{1,}\/?$/i,
  /\/slash\/[a-z0-9][a-z0-9_-]{1,}\/?$/i,
  /\/snippets?\/[a-z0-9][a-z0-9_-]{1,}\/?$/i,
]

interface FirecrawlMapResponse {
  success: boolean
  links:   string[]
  error?:  string
}

async function firecrawlMap(url: string): Promise<string[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) throw new Error('FIRECRAWL_API_KEY is not set')

  const res = await fetch(`${FIRECRAWL_BASE}/map`, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ url, limit: MAP_URL_LIMIT, ignoreSitemap: false }),
    signal:  AbortSignal.timeout(60_000),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Firecrawl map [${res.status}]: ${err}`)
  }

  const data = await res.json() as FirecrawlMapResponse
  if (!data.success) throw new Error(`Firecrawl map failed: ${data.error ?? 'unknown'}`)

  return data.links ?? []
}

async function countViaFirecrawl(url: string): Promise<number> {
  const links = await firecrawlMap(url)

  const skillPages = links.filter(link =>
    SKILL_PAGE_PATTERNS.some(pattern => pattern.test(link))
  )
  if (skillPages.length > 0) {
    console.log(`[skills-sync]   firecrawl → ${skillPages.length} skill page(s) via path patterns`)
    return skillPages.length
  }

  const skillFiles = links.filter(link => /\/skill\.md(?:\?|#|$)/i.test(link))
  console.log(`[skills-sync]   firecrawl → ${skillFiles.length} skill file(s) via .md paths`)
  return skillFiles.length
}

// ─────────────────────────────────────────────────────────────────────────────
// SANITY QUERY
// ─────────────────────────────────────────────────────────────────────────────

const SOURCES_QUERY = `
  *[_type == "skillSource" && status == "published" && defined(url)] {
    _id, name, url, skillCount, crawlErrors
  }
`

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export async function syncSkillCounts(): Promise<SkillsSyncResult> {
  const startTime   = Date.now()
  const sanityRead  = getSanityReadClient()
  const sanityWrite = getSanityWriteClient()

  const result: SkillsSyncResult = { updated: [], unchanged: [], failed: [], duration: 0 }

  const sources = await sanityRead.fetch<SkillSourceDoc[]>(SOURCES_QUERY)
  console.log(`[skills-sync] ${sources.length} published source(s)`)

  if (sources.length === 0) {
    result.duration = Date.now() - startTime
    return result
  }

  const now = new Date().toISOString()

  for (const source of sources) {
    const strategy = getStrategy(source.url)
    console.log(`[skills-sync] "${source.name}" [${strategy}] — ${source.url}`)

    try {
      let newCount: number

      if (strategy === 'github') {
        newCount = await countViaGitHub(source.url)
      } else if (strategy === 'npm') {
        newCount = await countViaNpm(source.url)
      } else {
        newCount = await countViaFirecrawl(source.url)
      }

      const prevCount = source.skillCount ?? null
      const changed   = prevCount !== newCount

      console.log(
        `[skills-sync] ✓ "${source.name}" — ${newCount} skill(s)` +
        (changed ? ` (was ${prevCount ?? 'unknown'})` : ' (unchanged)')
      )

      const patch: Record<string, unknown> = { lastCrawledAt: now, crawlErrors: 0 }
      if (changed) {
        patch.skillCount          = newCount
        patch.skillCountPrev      = prevCount ?? 0
        patch.skillCountUpdatedAt = now
      }

      await sanityWrite.patch(source._id).set(patch).commit()

      const r: SkillCountResult = {
        docId: source._id, name: source.name, strategy,
        newCount, prevCount, changed,
      }
      changed ? result.updated.push(r) : result.unchanged.push(r)

    } catch (err) {
      const error      = err instanceof Error ? err.message : String(err)
      const prevErrors = source.crawlErrors ?? 0
      const newErrors  = prevErrors + 1

      console.error(`[skills-sync] ✗ "${source.name}" [${strategy}]: ${error}`)

      if (newErrors >= CRAWL_ERROR_THRESHOLD) {
        console.warn(
          `[skills-sync] ⚠️  "${source.name}" has ${newErrors} consecutive failures — ` +
          `check the source URL or remove from directory`
        )
      }

      try {
        await sanityWrite
          .patch(source._id)
          .set({ lastCrawledAt: now, crawlErrors: newErrors })
          .commit()
      } catch {
        // best-effort — don't mask the original error
      }

      result.failed.push({
        docId: source._id, name: source.name, strategy,
        newCount: null, prevCount: source.skillCount ?? null, changed: false, error,
      })
    }
  }

  result.duration = Date.now() - startTime
  console.log(
    `[skills-sync] Done ${result.duration}ms — ` +
    `↑ ${result.updated.length} updated · ` +
    `= ${result.unchanged.length} unchanged · ` +
    `✗ ${result.failed.length} failed`
  )

  return result
}
