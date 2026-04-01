import { client } from '@sanity/lib/client'
import { allArticlesQuery } from '@sanity/lib/queries'
import { ArticlesGrid } from '@/components/articles/ArticlesGrid'
import type { Article } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Automation guides, workflow breakdowns, and tool deep-dives from Automation Switch.',
}

export const revalidate = 60

// Placeholder articles shown until Sanity is populated
const PLACEHOLDER_ARTICLES: Article[] = [
  { _id: 'pa0', title: 'Best Automation Tools for Small Businesses in 2026 (The Complete Guide)', slug: { current: 'best-automation-tools-small-businesses-2026' }, publishedAt: '2026-04-02T00:00:00Z', readTime: 15, excerpt: 'The complete guide to automation tools for small businesses. Category breakdowns, real stack recommendations, and a framework for choosing what to automate first.', category: { title: 'Tool Guide', slug: { current: 'tool-guide' } } },
  { _id: 'pa1', title: 'WHY MOST AUTOMATION PROJECTS STALL AT STEP THREE', slug: { current: 'why-automation-projects-stall' }, publishedAt: '2026-03-01T00:00:00Z', readTime: 7, excerpt: 'The failure is not in the tools. It is in how teams think about handoffs. Most automation stalls not because the technology is wrong, but because no one mapped what happens when the workflow hits a human decision point.', category: { title: 'Deep Dive', slug: { current: 'deep-dive' } } },
  { _id: 'pa2', title: 'Connecting Make.com to Your CRM Without Writing a Line of Code', slug: { current: 'make-crm' }, publishedAt: '2026-02-01T00:00:00Z', readTime: 5, excerpt: 'A step-by-step walkthrough for linking your CRM to Make.com using pre-built modules, custom webhooks, and data mapping.', category: { title: 'Tool Guide', slug: { current: 'tool-guide' } } },
  { _id: 'pa3', title: 'The 3-Layer Automation Stack Every Growing Business Needs', slug: { current: '3-layer-stack' }, publishedAt: '2026-02-01T00:00:00Z', readTime: 6, excerpt: 'Trigger layer, logic layer, action layer. Here is how to build a stack that scales with your team instead of breaking every quarter.', category: { title: 'Strategy', slug: { current: 'strategy' } } },
  { _id: 'pa4', title: 'Zapier vs Make vs n8n: Which Platform Is Right for Your Team', slug: { current: 'zapier-vs-make-vs-n8n' }, publishedAt: '2026-01-01T00:00:00Z', readTime: 9, excerpt: 'An honest comparison of three major automation platforms across price, flexibility, and team fit for growing businesses.', category: { title: 'Comparison', slug: { current: 'comparison' } } },
  { _id: 'pa5', title: 'How to Build a Lead Intake Pipeline That Never Sleeps', slug: { current: 'lead-intake-pipeline' }, publishedAt: '2026-01-01T00:00:00Z', readTime: 8, excerpt: 'Automate your lead intake from form submit to CRM entry to team notification in one connected flow.', category: { title: 'Tutorial', slug: { current: 'tutorial' } } },
  { _id: 'pa6', title: 'AI Agents in Business Workflows: What Is Actually Useful Right Now', slug: { current: 'ai-agents-in-workflows' }, publishedAt: '2025-12-01T00:00:00Z', readTime: 10, excerpt: 'Cutting through the hype to focus on what actually ships value in real-world automation today.', category: { title: 'Analysis', slug: { current: 'analysis' } } },
]

export default async function ArticlesPage() {
  const articles = await client.fetch<Article[]>(allArticlesQuery)
  const showArticles = (articles && articles.length > 0) ? articles : PLACEHOLDER_ARTICLES
  const count = articles?.length ?? 0

  return (
    <>
      {/* Page header */}
      <div className="articles-page-header">
        <div className="articles-page-header-inner">
          <div>
            <div className="page-eyebrow">From the archive</div>
            <h1 className="page-title-xl">ARTICLES</h1>
          </div>
          <div className="articles-page-count">
            {count > 0 ? (
              <>
                <span className="articles-count-num">{count}</span>
                <span className="articles-count-label">{count === 1 ? 'article' : 'articles'}</span>
              </>
            ) : (
              <>
                <span className="articles-count-num">{showArticles.length}</span>
                <span className="articles-count-label">articles</span>
              </>
            )}
          </div>
        </div>
        <p className="page-sub" style={{ maxWidth: '560px', marginTop: '12px' }}>
          Automation guides, workflow breakdowns, and tool deep-dives.
          Everything we know about making systems work together.
        </p>
      </div>

      {/* Interactive filter + grid */}
      <ArticlesGrid articles={showArticles} />
    </>
  )
}
