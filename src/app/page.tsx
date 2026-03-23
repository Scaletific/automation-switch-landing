import Link from 'next/link'
import { client } from '@sanity/lib/client'
import { homepageArticlesQuery, toolsQuery, allArticlesQuery } from '@sanity/lib/queries'
import { FeaturedArticle } from '@/components/articles/FeaturedArticle'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { ToolCard } from '@/components/home/ToolCard'
import { SubscribeForm } from '@/components/ui/SubscribeForm'
import { Ticker } from '@/components/home/Ticker'
import type { Article, Tool } from '@/lib/types'

export const revalidate = 60

// Placeholder content matching the mockup — shown until Sanity is populated
const PLACEHOLDER_TOOLS = [
  { _id: 'p1', name: 'PRECISION REACH', tagline: 'AI-powered cold email intelligence. Research an industry, surface stakeholder pain points, and generate high-converting email sequences automatically.', icon: '🎯', status: 'live' as const, url: '/precisionreach.html', slug: { current: 'precision-reach' }, order: 1 },
  { _id: 'p2', name: 'FLOWMAP', tagline: 'Visualise your existing workflow as a structured automation map. Identify where friction lives before you build a single trigger.', icon: '⚡', status: 'soon' as const, slug: { current: 'flowmap' }, order: 2 },
  { _id: 'p3', name: 'HOOKBASE', tagline: 'A lightweight webhook relay and inspector. Test, monitor, and debug integrations between your tools without a backend.', icon: '🔗', status: 'soon' as const, slug: { current: 'hookbase' }, order: 3 },
]

const PLACEHOLDER_FEATURED = {
  _id: 'pf1',
  title: 'WHY MOST AUTOMATION PROJECTS STALL AT STEP THREE',
  slug: { current: 'why-automation-projects-stall' },
  excerpt: 'The failure isn\'t in the tools. It\'s in how teams think about handoffs. Most automation stalls not because the technology is wrong — but because no one mapped what happens when the workflow hits a human decision point.',
  publishedAt: '2026-03-01T00:00:00Z',
  readTime: 7,
  category: { title: 'Deep Dive · Workflow Architecture' },
}

const PLACEHOLDER_SIDE = [
  { _id: 'ps1', title: 'Connecting Make.com to Your CRM Without Writing a Line of Code', slug: { current: 'make-crm' }, publishedAt: '2026-02-01T00:00:00Z', readTime: 5, excerpt: '', category: { title: 'Tool Guide' } },
  { _id: 'ps2', title: 'The 3-Layer Automation Stack Every Growing Business Needs', slug: { current: '3-layer-stack' }, publishedAt: '2026-02-01T00:00:00Z', readTime: 6, excerpt: '', category: { title: 'Strategy' } },
]

const PLACEHOLDER_ARCHIVE = [
  { num: '01', title: 'Zapier vs Make vs n8n — Which Automation Platform Is Right for Your Team', meta: 'Jan 2026 · Comparison · 9 min read', slug: 'zapier-vs-make-vs-n8n' },
  { num: '02', title: 'How to Build a Lead Intake Pipeline That Never Sleeps', meta: 'Jan 2026 · Tutorial · 8 min read', slug: 'lead-intake-pipeline' },
  { num: '03', title: 'AI Agents in Business Workflows: What\'s Actually Useful Right Now', meta: 'Dec 2025 · Analysis · 10 min read', slug: 'ai-agents-in-workflows' },
  { num: '04', title: 'The Anatomy of a Broken Automation — and How to Fix It', meta: 'Nov 2025 · Ops · 6 min read', slug: 'broken-automation-anatomy' },
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
  const showSide = (latest && latest.length > 0) ? latest.slice(0, 2) : PLACEHOLDER_SIDE
  const showTools = (tools && tools.length > 0) ? tools : PLACEHOLDER_TOOLS
  const archiveArticles = allArticles && allArticles.length > 2 ? allArticles.slice(2) : null

  return (
    <>
      <Ticker />

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-tag">Automation Intelligence</div>
          <h1 className="hero-title">
            FLIP THE<br />
            <span className="line2">SWITCH.</span>
          </h1>
          <p className="hero-sub">
            Tools, insights, and connected workflows for businesses that move fast.
            We build automation infrastructure so your team can focus on what actually matters.
          </p>
          <div className="hero-actions">
            <a href="#tools" className="btn-primary">Explore Tools</a>
            <a href="#articles" className="btn-ghost">Read Articles →</a>
          </div>
        </div>

        <div className="hero-sidebar" id="subscribe">
          <div className="sidebar-label">Stay in the loop</div>
          <SubscribeForm />
          <p className="subscribe-note">
            Automation guides, tool releases, and workflow breakdowns.
            No noise. Unsubscribe anytime.
          </p>
          <div className="stat-row">
            <div className="stat">
              <span className="stat-num">3</span>
              <span className="stat-label">Tools in dev</span>
            </div>
            <div className="stat">
              <span className="stat-num">12</span>
              <span className="stat-label">Articles planned</span>
            </div>
            <div className="stat">
              <span className="stat-num">∞</span>
              <span className="stat-label">Workflows possible</span>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* FEATURED ARTICLES */}
      <section className="section" id="articles">
        <div className="section-header">
          <h2 className="section-title">LATEST ARTICLES</h2>
          <Link href="/articles" className="section-link">All Articles →</Link>
        </div>

        <div className="featured-grid">
          <Link href={`/articles/${showFeatured.slug.current}`} className="featured-main" style={{ textDecoration: 'none' }}>
            <div className="article-category">{showFeatured.category?.title}</div>
            <h3 className="article-title-large">{showFeatured.title}</h3>
            <p className="article-excerpt">{showFeatured.excerpt}</p>
            <div className="article-meta">
              <span>{formatDate(showFeatured.publishedAt)}</span>
              <div className="article-meta-dot" />
              {showFeatured.readTime && <span>{showFeatured.readTime} min read</span>}
              <div className="article-meta-dot" />
              <span>Automation Switch</span>
            </div>
          </Link>

          <div className="featured-side">
            {showSide.map((article) => (
              <Link key={article._id} href={`/articles/${article.slug.current}`} className="featured-side-item" style={{ textDecoration: 'none' }}>
                <div className="article-category">{article.category?.title}</div>
                <div className="article-title">{article.title}</div>
                <div className="article-meta" style={{ marginTop: '10px' }}>
                  <span>{formatDate(article.publishedAt)}</span>
                  {article.readTime && <><div className="article-meta-dot" /><span>{article.readTime} min</span></>}
                </div>
              </Link>
            ))}
          </div>
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

      {/* FROM THE ARCHIVE */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">FROM THE ARCHIVE</h2>
          <Link href="/articles" className="section-link">View All →</Link>
        </div>
        <div className="articles-list">
          {archiveArticles ? archiveArticles.slice(0, 4).map((article, i) => (
            <Link key={article._id} href={`/articles/${article.slug.current}`} className="article-row">
              <div className="article-num">0{i + 1}</div>
              <div>
                <div className="article-row-title">{article.title}</div>
                <div className="article-row-meta">{formatDate(article.publishedAt)}{article.readTime ? ` · ${article.readTime} min read` : ''}</div>
              </div>
              <div className="article-row-arrow">→</div>
            </Link>
          )) : PLACEHOLDER_ARCHIVE.map((item) => (
            <div key={item.num} className="article-row">
              <div className="article-num">{item.num}</div>
              <div>
                <div className="article-row-title">{item.title}</div>
                <div className="article-row-meta">{item.meta}</div>
              </div>
              <div className="article-row-arrow">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <div className="mission" id="about">
        <div className="mission-eyebrow">What We&apos;re Building</div>
        <div className="mission-text">
          We build the tools and write<br />
          the playbooks so <em>you don&apos;t</em><br />
          have to figure it out alone.
        </div>
        <p className="mission-sub">
          Automation Switch is a growing resource for businesses that want to work smarter.
          We build practical tools, publish honest breakdowns of what works,
          and connect the workflows that keep organisations running.
        </p>
      </div>
    </>
  )
}
