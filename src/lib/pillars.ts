/**
 * Content pillar definitions and URL helpers.
 *
 * Every article in Sanity has a required `primaryPillar` field whose value
 * is one of the keys below.  The pillar determines the first segment of the
 * article's canonical URL:  /<pillar>/<slug>
 */

export const PILLAR_META: Record<string, { label: string }> = {
  'workflow-automation':  { label: 'Workflow Automation' },
  'ai-workflows':         { label: 'AI Workflows' },
  'tool-comparisons':     { label: 'Tool Comparisons' },
  'automation-audits':    { label: 'Automation Audits' },
  'hyperautomation':      { label: 'Hyperautomation' },
  'production-readiness': { label: 'Production Readiness' },
} as const

/** The set of valid pillar slugs (used for route validation). */
export const VALID_PILLARS = new Set(Object.keys(PILLAR_META))

/** Type-safe union of every valid pillar slug. */
export type PillarSlug = keyof typeof PILLAR_META

/** Returns true when `value` is a recognised pillar slug. */
export function isValidPillar(value: string): value is PillarSlug {
  return VALID_PILLARS.has(value)
}

/** Human-readable label for a pillar (falls back to the slug itself). */
export function pillarLabel(pillar: string): string {
  return PILLAR_META[pillar]?.label ?? pillar
}

/**
 * Build the canonical href for an article.
 *
 * If the article has a `primaryPillar`, the URL is `/<pillar>/<slug>`.
 * Otherwise it falls back to the legacy `/articles/<slug>` path (which
 * the old route will 301 to the correct pillar URL once the pillar is set).
 */
export function getArticleHref(article: {
  slug: { current: string }
  primaryPillar?: string | null
}): string {
  if (article.primaryPillar && isValidPillar(article.primaryPillar)) {
    return `/${article.primaryPillar}/${article.slug.current}`
  }
  return `/articles/${article.slug.current}`
}
