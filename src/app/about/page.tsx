import type { Metadata } from 'next'
import Link from 'next/link'
import { SubscribeForm } from '@/components/ui/SubscribeForm'

export const metadata: Metadata = {
  title: 'About Automation Switch | Workflow Automation Guides, AI Tools & Skills Directory',
  description:
    'Automation Switch publishes practical workflow automation guides, builds AI-powered tools like PrecisionReach, and curates the largest SKILL.md directory for AI coding agents. Built by Scaletific.',
  openGraph: {
    title: 'About Automation Switch | Workflow Automation Guides, AI Tools & Skills Directory',
    description:
      'Practical automation guides, AI-powered tools, and the SKILL.md directory for teams running agents in production.',
    url: 'https://automationswitch.com/about',
    siteName: 'Automation Switch',
    type: 'website',
  },
  alternates: {
    canonical: 'https://automationswitch.com/about',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Automation Switch',
  url: 'https://automationswitch.com',
  description:
    'Automation Switch publishes practical workflow automation guides, builds AI-powered tools, and curates the SKILL.md directory for AI coding agents.',
  parentOrganization: { '@type': 'Organization', name: 'Scaletific' },
  sameAs: [
    'https://x.com/automationswitch',
    'https://linkedin.com/company/automationswitch',
  ],
}

const PILLARS = [
  {
    num: '01',
    name: 'ARTICLES',
    href: '/articles',
    desc: 'Deep dives and strategy breakdowns on workflow automation, business process design, and connected systems. Written for practitioners who build in production — not for people learning to prompt.',
    cta: 'Read Articles →',
  },
  {
    num: '02',
    name: 'TOOLS',
    href: '/tools',
    desc: 'AI-powered tools built around real workflow bottlenecks. PrecisionReach automates cold email intelligence. Each tool ships when a genuine problem justifies building — not before.',
    cta: 'Explore Tools →',
  },
  {
    num: '03',
    name: 'SKILLS HUB',
    href: '/skills',
    desc: 'The canonical directory of SKILL.md sources for AI coding agents across Claude Code, Cursor, Copilot, Gemini CLI, and more. We are the index — not the database.',
    cta: 'Browse Skills →',
  },
]

const AUDIENCE = [
  { num: '01', label: 'Operations Engineers', desc: 'Connecting systems, eliminating manual handoffs, and automating the repeatable work that slows everything down.' },
  { num: '02', label: 'Platform Teams', desc: 'Governing agent workflows and tooling standards across engineering organisations at scale.' },
  { num: '03', label: 'Solo Founders', desc: 'Moving fast with AI agents before you can afford to hire a full engineering team.' },
  { num: '04', label: 'Developers', desc: 'Configuring agents with proven SKILL.md files instead of reinventing configuration from scratch.' },
  { num: '05', label: 'Product Managers', desc: 'Understanding what automation actually enables, what it costs, and when to commission it.' },
  { num: '06', label: 'Technical Leaders', desc: 'Making architectural choices about automation before those choices become entrenched technical debt.' },
]

const PRINCIPLES = [
  {
    num: '01',
    title: 'REAL PROBLEMS FIRST',
    body: 'Every article starts with a workflow someone is actually running. We do not cover tools in the abstract. We cover what happens when they hit production load.',
  },
  {
    num: '02',
    title: 'WE ARE THE INDEX',
    body: 'For Skills Hub: we curate, verify, and link. The skills live at the source. We surface the signal — we do not hoard the content.',
  },
  {
    num: '03',
    title: 'SHIP FIRST, REFINE SECOND',
    body: 'Our tools follow the same discipline: identify a genuine bottleneck, build a focused solution, ship early, and improve based on how people actually use it.',
  },
  {
    num: '04',
    title: 'PRODUCTION REALITY',
    body: 'Automation Switch is a product of Scaletific — working across platform engineering, infrastructure, and enterprise automation. That background shapes every sentence we publish.',
  },
]

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* TICKER — light variant */}
      <div className="ticker-wrap ticker-wrap--light">
        <div className="ticker-inner">
          <span>Workflow Automation</span><span className="ticker-sep">///</span>
          <span className="accent">SKILL.md</span><span className="ticker-sep">///</span>
          <span>Agent Orchestration</span><span className="ticker-sep">///</span>
          <span>No-Code Pipelines</span><span className="ticker-sep">///</span>
          <span className="accent">BUILT BY SCALETIFIC</span><span className="ticker-sep">///</span>
          <span>Connected Systems</span><span className="ticker-sep">///</span>
          <span>AI Tooling</span><span className="ticker-sep">///</span>
          <span className="accent">PRODUCTION-FIRST</span><span className="ticker-sep">///</span>
          <span>Workflow Automation</span><span className="ticker-sep">///</span>
          <span className="accent">SKILL.md</span><span className="ticker-sep">///</span>
          <span>Agent Orchestration</span><span className="ticker-sep">///</span>
          <span>No-Code Pipelines</span><span className="ticker-sep">///</span>
          <span className="accent">BUILT BY SCALETIFIC</span><span className="ticker-sep">///</span>
          <span>Connected Systems</span><span className="ticker-sep">///</span>
          <span>AI Tooling</span><span className="ticker-sep">///</span>
          <span className="accent">PRODUCTION-FIRST</span><span className="ticker-sep">///</span>
        </div>
      </div>

      {/* HERO — 2-col split */}
      <section className="about-hero">
        {/* LEFT — headline + CTAs */}
        <div className="about-hero-left">
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--amber)',
            marginBottom: '20px',
          }}>
            About Automation Switch
          </div>
          <h1 className="page-title-xl">
            TECHNOLOGY<br />
            CREATES<br />
            <span>ABUNDANCE.</span>
          </h1>
          <p style={{
            marginTop: '24px',
            fontSize: '14px',
            fontWeight: 300,
            lineHeight: 1.8,
            color: 'var(--text)',
            maxWidth: '400px',
          }}>
            Everybody should be able to tap into it. We write the playbooks, deliver
            the breakdowns, build the tools, and explore what automation makes
            possible — so nobody gets left behind.
          </p>
          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/articles" className="btn-primary">Read Articles</Link>
            <Link href="/skills" className="btn-ghost">Browse Skills →</Link>
          </div>
        </div>

        {/* RIGHT — dark card with manifesto + inline stats */}
        <div className="about-hero-right">
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--amber)',
            marginBottom: '20px',
          }}>
            Our stance
          </div>
          <div style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(22px, 2.4vw, 36px)',
            lineHeight: 1.15,
            letterSpacing: '0.02em',
            color: 'var(--text-inv)',
          }}>
            We write the playbooks.<br />
            We build the tools.<br />
            We explore automation —<br />
            so no one{' '}
            <span style={{ color: 'var(--amber-bright)' }}>gets left behind.</span>
          </div>
          <div style={{
            marginTop: '40px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            gap: '32px',
          }}>
            {[
              { num: '7,730+', label: 'Skills Indexed' },
              { num: '8', label: 'Curated Sources' },
              { num: '6', label: 'Agent Platforms' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{
                  fontFamily: 'var(--display)',
                  fontSize: '32px',
                  color: 'var(--amber-bright)',
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                }}>
                  {stat.num}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '9px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--text-inv-dim)',
                  marginTop: '6px',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <div className="section-bar">
        <span className="section-bar-label">WHAT WE DO</span>
      </div>
      <div className="tools-grid">
        {PILLARS.map((p) => (
          <Link key={p.num} href={p.href} className="tool-card">
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '28px',
              fontWeight: 300,
              color: 'var(--amber)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginBottom: '16px',
            }}>
              {p.num}
            </div>
            <div className="tool-name">{p.name}</div>
            <p className="tool-desc">{p.desc}</p>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--amber)',
              marginTop: '8px',
            }}>
              {p.cta}
            </div>
          </Link>
        ))}
      </div>

      {/* WHO WE BUILD FOR */}
      <div className="section-bar">
        <span className="section-bar-label">WHO WE BUILD FOR</span>
      </div>
      <div className="article-grid">
        {AUDIENCE.map((a) => (
          <div key={a.num} className="article-grid-item">
            <div className="article-category">{a.num}</div>
            <div className="article-grid-title">{a.label}</div>
            <div className="article-grid-excerpt">{a.desc}</div>
          </div>
        ))}
      </div>

      {/* HOW WE OPERATE — principles manifesto */}
      <div className="section-bar">
        <span className="section-bar-label">HOW WE OPERATE</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        borderBottom: '1px solid var(--border)',
      }}>
        {PRINCIPLES.map((p, i) => (
          <div key={p.num} style={{
            padding: '48px',
            borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
            borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              color: 'var(--amber)',
              marginBottom: '14px',
            }}>
              {p.num}
            </div>
            <div style={{
              fontFamily: 'var(--display)',
              fontSize: '20px',
              letterSpacing: '0.06em',
              color: 'var(--text-bright)',
              marginBottom: '14px',
            }}>
              {p.title}
            </div>
            <p style={{
              fontSize: '13px',
              fontWeight: 300,
              lineHeight: 1.8,
              color: 'var(--text)',
            }}>
              {p.body}
            </p>
          </div>
        ))}
      </div>

      {/* STAT BAND */}
      <div className="stat-band">
        <div className="stat-band-inner">
          <div className="stat-band-item">
            <div className="stat-band-num">7,730+</div>
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
            <div className="stat-band-num">1</div>
            <div className="stat-band-label">Live Tool</div>
          </div>
        </div>
      </div>

      {/* NEWSLETTER + SOCIAL CTA */}
      <div className="newsletter-band" id="contact">
        <div className="newsletter-band-inner">
          <div>
            <div className="newsletter-band-eyebrow">Stay connected</div>
            <div className="newsletter-band-title">
              GET UPDATES<br />
              <span>WHEN THINGS</span><br />
              SHIP.
            </div>
            <p className="newsletter-band-sub">
              One email per week. New skills discovered, tool releases, and honest takes
              on what is working in automation right now.
            </p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href="https://x.com/automationswitch"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                Follow on X →
              </a>
              <a
                href="https://linkedin.com/company/automationswitch"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                LinkedIn →
              </a>
            </div>
          </div>
          <div className="newsletter-band-form">
            <SubscribeForm />
          </div>
        </div>
      </div>
    </>
  )
}
