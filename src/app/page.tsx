import Link from 'next/link'
import { client } from '@sanity/lib/client'
import { homepageArticlesQuery, toolsQuery, allArticlesQuery } from '@sanity/lib/queries'
import { ToolCard } from '@/components/home/ToolCard'
import { SubscribeForm } from '@/components/ui/SubscribeForm'
import { Ticker } from '@/components/home/Ticker'
import type { Article, Tool } from '@/lib/types'

export const revalidate = 60

// Placeholder content shown until Sanity is populated
const PLACEHOLDER_TOOLS = [
  { _id: 'p1', name: 'PRECISION REACH', tagline: 'AI-powered cold email intelligence. Research an industry, surface stakeholder pain points, and generate high-converting email sequences automatically.', icon: '🎯', status: 'live' as const, url: '/precisionreach.html', slug: { current: 'precision-reach' }, order: 1 },
  { _id: 'p2', name: 'FLOWMAP', tagline: 'Visualise your existing workflow as a structured automation map. Identify where friction lives before you build a single trigger.', icon: '⚡', status: 'soon' as const, slug: { current: 'flowmap' }, order: 2 },
  { _id: 'p3', name: 'HOOKBASE', tagline: 'A lightweight webhook relay and inspector. Test, monitor, and debug integrations between your tools without a backend.', icon: '🔗', status: 'soon' as const, slug: { current: 'hookbase' }, order: 3 },
]

const PLACEHOLDER_FEATURED = {
  _id: 'pf1',
  title: 'WHY MOST AUTOMATION PROJECTS STALL AT STEP THREE',
  slug: { current: 'why-automation-projects-stall' },
  excerpt: 'The failure is not in the tools. It is in how teams think about handoffs. Most automation stalls not because the technology is wrong, but because no one mapped what happens when the workflow hits a human decision point.',
  publishedAt: '2026-03-01T00:00:00Z',
  readTime: 7,
  category: { title: 'Deep Dive' },
}

const PLACEHOLDER_ARTICLES = [
  { _id: 'pa1', title: 'Connecting Make.com to Your CRM Without Writing a Line of Code', slug: { current: 'make-crm' }, publishedAt: '2026-02-01T00:00:00Z', readTime: 5, excerpt: 'A step-by-step walkthrough for linking your CRM to Make.com using pre-built modules, custom webhooks, and data mapping.', category: { title: 'Tool Guide' } },
  { _id: 'pa2', title: 'The 3-Layer Automation Stack Every Growing Business Needs', slug: { current: '3-layer-stack' }, publishedAt: '2026-02-01T00:00:00Z', readTime: 6, excerpt: 'Trigger layer, logic layer, action layer. Here is how to build a stack that scales with your team instead of breaking every quarter.', category: { title: 'Strategy' } },
  { _id: 'pa3', title: 'Zapier vs Make vs n8n — Which Platform Is Right for Your Team', slug: { current: 'zapier-vs-make-vs-n8n' }, publishedAt: '2026-01-01T00:00:00Z', readTime: 9, excerpt: 'An honest comparison of three major automation platforms across price, flexibility, and team fit for growing businesses.', category: { title: 'Comparison' } },
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
  const showTools = (tools && tools.length > 0) ? tools : PLACEHOLDER_TOOLS

  return (
    <>
      <Ticker />

      {/* HERO — two-column: text left, featured article right */}
      <section className="hero-v1">
        <div className="hero-v1-text">
          <div className="hero-tag">Automation Intelligence</div>
          <h1 className="hero-title">
            FLIP THE<br />
            <span className="line2">SWITCH.</span>
          </h1>
          <p className="hero-sub">
            Tools, insights, and connected workflows for businesses that move fast.
            We build automation infrastructure so your team can focus on what matters.
          </p>
          <div className="hero-actions">
            <a href="#tools" className="btn-primary">Explore Tools</a>
            <Link href="/articles" className="btn-ghost">Read Articles →</Link>
          </div>
        </div>

        <Link href={`/articles/${showFeatured.slug.current}`} className="hero-v1-card">
          <div className="hero-v1-card-label">Featured Article</div>
          {showFeatured.category && (
            <div className="article-category">{showFeatured.category.title}</div>
          )}
          <div className="hero-v1-card-title">{showFeatured.title}</div>
          <div className="hero-v1-card-excerpt">{showFeatured.excerpt}</div>
          <div className="hero-v1-card-meta">
            <span>{formatDate(showFeatured.publishedAt)}</span>
            {showFeatured.readTime && <><span>·</span><span>{showFeatured.readTime} min read</span></>}
          </div>
          <div className="hero-v1-card-arrow">Read article →</div>
        </Link>
      </section>

      {/* STAT BAND */}
      <div className="stat-band">
        <div className="stat-band-inner">
          <div className="stat-band-item">
            <div className="stat-band-num">3</div>
            <div className="stat-band-label">Tools in development</div>
            <div className="stat-band-desc">From cold email automation to workflow visualisation and webhook inspection.</div>
          </div>
          <div className="stat-band-item">
            <div className="stat-band-num">12</div>
            <div className="stat-band-label">Articles planned</div>
            <div className="stat-band-desc">Deep dives, tool guides, and strategy breakdowns already in the pipeline.</div>
          </div>
          <div className="stat-band-item">
            <div className="stat-band-num">∞</div>
            <div className="stat-band-label">Workflows possible</div>
            <div className="stat-band-desc">Every business has a unique stack. We help you connect it.</div>
          </div>
        </div>
      </div>

      {/* LATEST ARTICLES — 3-col grid */}
      <section className="section" id="articles">
        <div className="section-header">
          <h2 className="section-title">LATEST ARTICLES</h2>
          <Link href="/articles" className="section-link">All Articles →</Link>
        </div>
        <div className="article-grid">
          {showArticles.map((article) => (
            <Link key={article._id} href={`/articles/${article.slug.current}`} className="article-grid-item">
              {article.category && (
                <div className="article-category">{article.category.title}</div>
              )}
              <div className="article-grid-title">{article.title}</div>
              {article.excerpt && (
                <div className="article-grid-excerpt">{article.excerpt}</div>
              )}
              <div className="article-grid-meta">
                <span>{formatDate(article.publishedAt)}</span>
                {article.readTime && <><span>·</span><span>{article.readTime} min</span></>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section className="section" id="tools">
        <div className="section-header">
          <h2 className="section-title">OUR TOOLS</h2>
          <Link href="/tools" className="section-link">All Tools →</Link>
        </div>
        <div className="tools-grid">
          {showTools.map((tool) => (
            <ToolCard key={tool._id} tool={tool} />
          ))}
        </div>
      </section>

      {/* SKILLS CALLOUT */}
      <div className="skills-callout">
        <div className="skills-callout-inner">
          <div>
            <div className="skills-callout-eyebrow">Skills Hub</div>
            <div className="skills-callout-title">THE CANONICAL INDEX<br />OF SKILL.MD SOURCES</div>
            <p className="skills-callout-sub">
              We track the best collections of SKILL.md files for AI coding agents. One directory,
              vetted sources, always up to date.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Link href="/skills" className="btn-primary" style={{ display: 'block', textAlign: 'center', whiteSpace: 'nowrap' }}>
              Browse the Directory →
            </Link>
          </div>
        </div>
      </div>

      {/* NEWSLETTER BAND */}
      <div className="newsletter-band" id="subscribe">
        <div className="newsletter-band-inner">
          <div>
            <div className="newsletter-band-eyebrow">Stay in the loop</div>
            <div className="newsletter-band-title">
              AUTOMATION<br />
              <span>INTELLIGENCE</span><br />
              DELIVERED.
            </div>
            <p className="newsletter-band-sub">
              Workflow guides, tool releases, and automation breakdowns.
              No noise. Unsubscribe anytime.
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
