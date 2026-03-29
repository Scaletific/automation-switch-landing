import Link from 'next/link'
import { client } from '@sanity/lib/client'
import { homepageArticlesQuery, toolsQuery, allArticlesQuery } from '@sanity/lib/queries'
import { SubscribeForm } from '@/components/ui/SubscribeForm'
import { Ticker } from '@/components/home/Ticker'
import type { Article, Tool } from '@/lib/types'

export const revalidate = 60

// Placeholder content shown until Sanity is populated
const PLACEHOLDER_TOOLS: Tool[] = [
  { _id: 'p1', name: 'PRECISION REACH', tagline: 'AI-powered cold email intelligence. Research an industry, surface stakeholder pain points, and generate high-converting email sequences automatically.', icon: '🎯', status: 'live', url: '/precisionreach.html', slug: { current: 'precision-reach' } },
  { _id: 'p2', name: 'FLOWMAP', tagline: 'Visualise your existing workflow as a structured automation map. Identify where friction lives before you build a single trigger.', icon: '⚡', status: 'soon', url: null, slug: { current: 'flowmap' } },
  { _id: 'p3', name: 'HOOKBASE', tagline: 'A lightweight webhook relay and inspector. Test, monitor, and debug integrations between your tools without a backend.', icon: '🔗', status: 'soon', url: null, slug: { current: 'hookbase' } },
  { _id: 'p4', name: 'SKILLS BUILDER', tagline: 'Draft, validate, and publish SKILL.md files for your AI agent workflows in minutes.', icon: '🧠', status: 'soon', url: null, slug: { current: 'skills-builder' } },
]

const PLACEHOLDER_FEATURED: Article = {
  _id: 'pf1',
  title: 'SKILL.md Files: The Configuration Primitive Every Agent Builder Should Know',
  slug: { current: 'why-automation-projects-stall' },
  excerpt: 'Most developers configuring AI coding agents never discover that the most powerful form of customisation ships as a plain markdown file.',
  publishedAt: '2026-03-01T00:00:00Z',
  readTime: 12,
  category: { title: 'Deep Dive', slug: { current: 'deep-dive' } },
}

const PLACEHOLDER_ARTICLES: Article[] = [
  { _id: 'pa1', title: 'Building a Notion to Sanity Sync Pipeline in 2026', slug: { current: 'make-crm' }, publishedAt: '2026-02-01T00:00:00Z', readTime: 8, excerpt: 'How we wired Notion as a CMS frontend to Sanity as a delivery layer, with a Vercel cron job running every 30 minutes and zero manual deploys.', category: { title: 'Tool Guide', slug: { current: 'tool-guide' } } },
  { _id: 'pa2', title: 'The Agent Governance Layer Most Teams Skip', slug: { current: '3-layer-stack' }, publishedAt: '2026-02-01T00:00:00Z', readTime: 6, excerpt: 'A capable agent and a trustworthy agent are different things. Here is the configuration layer that separates teams shipping reliably from teams cleaning up messes.', category: { title: 'Strategy', slug: { current: 'strategy' } } },
  { _id: 'pa3', title: 'Zapier vs Make vs n8n — Which Platform Is Right for Your Team', slug: { current: 'zapier-vs-make-vs-n8n' }, publishedAt: '2026-01-01T00:00:00Z', readTime: 9, excerpt: 'An honest comparison of three major automation platforms across price, flexibility, and team fit for growing businesses.', category: { title: 'Comparison', slug: { current: 'comparison' } } },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export default async function HomePage() {
  const [{ featured, latest }, tools, allArticles] = await Promise.all([
    client.fetch<{ featured: Article; latest: Article[] }>(homepageArticlesQuery),
    client.fetch<Tool[]>(toolsQuery),
    client.fetch<Article[]>(allArticlesQuery),
  ])

  const showFeatured = featured ?? PLACEHOLDER_FEATURED
  const showArticles = (allArticles && allArticles.length > 0) ? allArticles.slice(0, 3) : PLACEHOLDER_ARTICLES
  const showTools = (tools && tools.length > 0) ? tools.slice(0, 4) : PLACEHOLDER_TOOLS

  return (
    <>
      <Ticker />

      {/* HERO — full-width two-column */}
      <section className="hero-v1">
        <div className="hero-v1-text">
          <div className="hero-tag">For builders who ship with AI</div>
          <h1 className="hero-title">
            Automate<br />
            the work<br />
            that <span className="line2">matters.</span>
          </h1>
          <p className="hero-sub">
            Practical guides, tooling, and a skills directory for teams running AI agents in production.
            No tutorials about prompting. No hype. Just what works.
          </p>
          <div className="hero-actions">
            <Link href="/articles" className="btn-primary">Read the Articles</Link>
            <Link href="/skills" className="btn-ghost">Browse Skills →</Link>
          </div>
        </div>

        <Link href={`/articles/${showFeatured.slug.current}`} className="hero-v1-card">
          <div className="hero-v1-card-label">Latest</div>
          {showFeatured.category && (
            <div className="hero-v1-card-cat">{showFeatured.category.title}&nbsp;·&nbsp;{showFeatured.readTime} min read</div>
          )}
          <div className="hero-v1-card-title">{showFeatured.title}</div>
          <div className="hero-v1-card-excerpt">{showFeatured.excerpt}</div>
          <div className="hero-v1-card-arrow">Read Article</div>
        </Link>
      </section>

      {/* STAT BAND — 4 items */}
      <div className="stat-band">
        <div className="stat-band-inner">
          <div className="stat-band-item">
            <div className="stat-band-num">7,530+</div>
            <div className="stat-band-label">Skills Indexed</div>
          </div>
          <div className="stat-band-item">
            <div className="stat-band-num">8</div>
            <div className="stat-band-label">Curated Sources</div>
          </div>
          <div className="stat-band-item">
            <div className="stat-band-num">6</div>
            <div className="stat-band-label">Agent Platforms</div>
          </div>
          <div className="stat-band-item">
            <div className="stat-band-num">∞</div>
            <div className="stat-band-label">Workflows Possible</div>
          </div>
        </div>
      </div>

      {/* LATEST ARTICLES — section bar + featured lead + 2-col secondary grid */}
      <div className="section-bar">
        <span className="section-bar-label">Latest Articles</span>
        <Link href="/articles" className="section-bar-link">View All →</Link>
      </div>
      {showArticles.length > 0 && (() => {
        const [lead, ...rest] = showArticles
        return (
          <>
            <Link href={`/articles/${lead.slug.current}`} className="article-featured">
              <div className="article-featured-text">
                <div className="article-featured-label">Latest</div>
                {lead.kicker && <div className="article-kicker">{lead.kicker}</div>}
                <div className="article-featured-title">{lead.title}</div>
                {lead.excerpt && <div className="article-featured-excerpt">{lead.excerpt}</div>}
                <div className="article-featured-meta">
                  {lead.category && <span>{lead.category.title}</span>}
                  {lead.category && lead.readTime && <span>·</span>}
                  <span>{formatDate(lead.publishedAt)}</span>
                  {lead.readTime && <><span>·</span><span>{lead.readTime} min</span></>}
                </div>
              </div>
              <div className="article-featured-side">
                <div className="article-featured-side-label">Read Article →</div>
                <div className="article-featured-side-title">
                  {lead.category?.title ?? 'Deep Dive'}
                </div>
                <div className="article-featured-side-sub">
                  Practical analysis for teams building with AI and automation.
                </div>
              </div>
            </Link>
            {rest.length > 0 && (
              <div className="article-grid-2col">
                {rest.map((article) => (
                  <Link key={article._id} href={`/articles/${article.slug.current}`} className="article-grid-item">
                    {article.category && <div className="article-category">{article.category.title}</div>}
                    {article.kicker && <div className="article-kicker">{article.kicker}</div>}
                    <div className="article-grid-title">{article.title}</div>
                    {article.excerpt && <div className="article-grid-excerpt">{article.excerpt}</div>}
                    <div className="article-grid-meta">
                      <span>{formatDate(article.publishedAt)}</span>
                      {article.readTime && <><span>·</span><span>{article.readTime} min</span></>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )
      })()}

      {/* SKILLS CALLOUT — full-width amber-light band */}
      <div className="skills-callout">
        <div>
          <div className="skills-callout-eyebrow">New — Skills Hub</div>
          <div className="skills-callout-title">The SKILL.md Directory</div>
          <p className="skills-callout-sub">
            The index the agent ecosystem has been missing. Browse, filter, and copy SKILL.md files
            by domain, platform, and use case. Built with Firecrawl. Growing weekly.
          </p>
          <div style={{ marginTop: '16px' }}>
            <Link href="/skills" className="btn-primary">Browse the Directory →</Link>
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div className="skills-count">7,530+</div>
          <div className="skills-count-label">Skills Indexed</div>
        </div>
      </div>

      {/* TOOLS — section bar + 4-col strip */}
      <div className="section-bar">
        <span className="section-bar-label">Tools</span>
        <Link href="/tools" className="section-bar-link">View All →</Link>
      </div>
      <div className="tools-strip">
        {showTools.map((tool) => (
          <a
            key={tool._id}
            href={tool.url ?? '#'}
            className="tool-strip-card"
            target={tool.url?.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
          >
            <div className="tool-strip-tag">{tool.status === 'live' ? 'Live' : tool.status === 'beta' ? 'Beta' : 'Coming Soon'}</div>
            <div className="tool-strip-name">{tool.name}</div>
            <div className="tool-strip-desc">{tool.tagline}</div>
          </a>
        ))}
      </div>

      {/* NEWSLETTER BAND */}
      <div className="newsletter-band" id="subscribe">
        <div className="newsletter-band-inner">
          <div>
            <div className="newsletter-band-eyebrow">Weekly Newsletter</div>
            <div className="newsletter-band-title">
              Stay ahead of<br />
              the <span>agent curve.</span>
            </div>
            <p className="newsletter-band-sub">
              One email per week. New skills discovered, tools worth knowing, and what the community
              is building with AI agents in production. No noise, no hype.
            </p>
          </div>
          <div className="newsletter-band-form">
            <SubscribeForm />
          </div>
        </div>
      </div>
    </>
  )
}
