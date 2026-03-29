import Link from 'next/link'
import { client } from '@sanity/lib/client'
import { allArticlesQuery } from '@sanity/lib/queries'
import type { Article } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Automation guides, workflow breakdowns, and tool deep-dives from Automation Switch.',
}

export const revalidate = 60

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

// Placeholder articles shown until Sanity is populated
const PLACEHOLDER_ARTICLES = [
  { _id: 'pa1', title: 'WHY MOST AUTOMATION PROJECTS STALL AT STEP THREE', slug: { current: 'why-automation-projects-stall' }, publishedAt: '2026-03-01T00:00:00Z', readTime: 7, excerpt: 'The failure is not in the tools. It is in how teams think about handoffs.', category: { title: 'Deep Dive' } },
  { _id: 'pa2', title: 'Connecting Make.com to Your CRM Without Writing a Line of Code', slug: { current: 'make-crm' }, publishedAt: '2026-02-01T00:00:00Z', readTime: 5, excerpt: 'A step-by-step walkthrough for linking your CRM to Make.com using pre-built modules.', category: { title: 'Tool Guide' } },
  { _id: 'pa3', title: 'The 3-Layer Automation Stack Every Growing Business Needs', slug: { current: '3-layer-stack' }, publishedAt: '2026-02-01T00:00:00Z', readTime: 6, excerpt: 'Trigger layer, logic layer, action layer. Here is how to build a stack that scales with your team.', category: { title: 'Strategy' } },
  { _id: 'pa4', title: 'Zapier vs Make vs n8n — Which Platform Is Right for Your Team', slug: { current: 'zapier-vs-make-vs-n8n' }, publishedAt: '2026-01-01T00:00:00Z', readTime: 9, excerpt: 'An honest comparison across price, flexibility, and team fit for growing businesses.', category: { title: 'Comparison' } },
  { _id: 'pa5', title: 'How to Build a Lead Intake Pipeline That Never Sleeps', slug: { current: 'lead-intake-pipeline' }, publishedAt: '2026-01-01T00:00:00Z', readTime: 8, excerpt: 'Automate your lead intake from form submit to CRM entry to team notification in one flow.', category: { title: 'Tutorial' } },
  { _id: 'pa6', title: 'AI Agents in Business Workflows: What Is Actually Useful Right Now', slug: { current: 'ai-agents-in-workflows' }, publishedAt: '2025-12-01T00:00:00Z', readTime: 10, excerpt: 'Cutting through the hype to focus on what actually ships value in real-world automation today.', category: { title: 'Analysis' } },
]

export default async function ArticlesPage() {
  const articles = await client.fetch<Article[]>(allArticlesQuery)
  const showArticles = (articles && articles.length > 0) ? articles : PLACEHOLDER_ARTICLES
  const count = articles?.length ?? 0

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div className="page-eyebrow">From the archive</div>
        <h1 className="page-title-xl">ARTICLES</h1>
        <p className="page-sub">
          Automation guides, workflow breakdowns, and tool deep-dives.
          Everything we know about making systems work together.
        </p>
        {count > 0 && (
          <div className="count-badge">{count} {count === 1 ? 'article' : 'articles'}</div>
        )}
      </div>

      {/* Article grid */}
      <section className="section">
        {showArticles.length === 0 ? (
          <p style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dim)' }}>
            No articles yet — check back soon.
          </p>
        ) : (
          <div className="article-grid">
            {showArticles.map((article) => (
              <Link
                key={article._id}
                href={`/articles/${article.slug.current}`}
                className="article-grid-item"
              >
                {article.category && (
                  <div className="article-category">{article.category.title}</div>
                )}
                <div className="article-grid-title">{article.title}</div>
                {article.excerpt && (
                  <div className="article-grid-excerpt">{article.excerpt}</div>
                )}
                <div className="article-grid-meta">
                  <span>{formatDate(article.publishedAt)}</span>
                  {article.readTime && (
                    <><span>·</span><span>{article.readTime} min read</span></>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
