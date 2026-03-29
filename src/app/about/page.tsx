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
  parentOrganization: {
    '@type': 'Organization',
    name: 'Scaletific',
  },
  sameAs: [
    'https://x.com/automationswitch',
    'https://linkedin.com/company/automationswitch',
  ],
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-eyebrow">Who we are</div>
        <h1 className="page-title-xl">ABOUT</h1>
        <p className="page-sub">
          Automation Switch is where practitioners come to learn what actually works in workflow automation, AI tooling, and agent orchestration.
        </p>
      </div>

      {/* MISSION */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">THE MISSION</h2>
        </div>

        <div className="mission" style={{ margin: '0 0 48px', maxWidth: '100%' }}>
          <div className="mission-eyebrow">Why we exist</div>
          <div className="mission-text">
            We build the tools and write<br />
            the playbooks so <em>you do not</em><br />
            have to figure it out alone.
          </div>
          <p className="mission-sub">
            Teams deserve honest breakdowns written by people who have shipped real workflows,
            tools built around real problems, and a directory that saves hours
            of searching for the right agent configuration. That is why we started
            Automation Switch.
          </p>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">WHAT WE DO</h2>
        </div>

        <div className="tools-grid" style={{ marginTop: '24px' }}>
          <Link href="/articles" className="tool-card">
            <div className="tool-icon">📝</div>
            <div className="tool-name">ARTICLES</div>
            <p className="tool-desc">
              Deep dives, tool comparisons, and strategy breakdowns on workflow automation, business process design, and connected systems.
              Every piece is written for practitioners who are actively building.
            </p>
          </Link>
          <Link href="/tools" className="tool-card">
            <div className="tool-icon">⚙️</div>
            <div className="tool-name">TOOLS</div>
            <p className="tool-desc">
              AI-powered tools built around real workflow problems. Our first tool, PrecisionReach, automates cold email research
              and generation. More are on the way, each designed to solve a specific bottleneck we have seen teams hit.
            </p>
          </Link>
          <Link href="/skills" className="tool-card">
            <div className="tool-icon">📂</div>
            <div className="tool-name">SKILLS HUB</div>
            <p className="tool-desc">
              The canonical directory of SKILL.md sources for AI coding agents across Claude Code, Cursor, Copilot, Gemini CLI, and more.
              We curate the index. The content lives at the source. Over 200 skills indexed and growing weekly.
            </p>
          </Link>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">WHO THIS IS FOR</h2>
        </div>

        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p className="body-copy" style={{ marginBottom: '24px' }}>
            Automation Switch is built for operations teams, developers, founders, and anyone
            responsible for making systems talk to each other. Whether you are connecting your first
            Zapier trigger or orchestrating multi-agent workflows in production, the content here
            meets you where you are.
          </p>
          <p className="body-copy" style={{ marginBottom: '24px' }}>
            We cover no-code platforms like Zapier, Make, and n8n alongside code-first approaches,
            AI agent configuration, and the emerging SKILL.md ecosystem. If you care about
            eliminating manual handoffs and building workflows that hold up under real load,
            you are in the right place.
          </p>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">HOW WE WORK</h2>
        </div>

        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p className="body-copy" style={{ marginBottom: '24px' }}>
            Everything we publish starts with a real workflow problem.
            Articles go through research, drafting, editorial review, and an SEO quality
            gate before they go live. Our tools follow the same discipline: identify a genuine
            bottleneck, build a focused solution, ship early, and improve based on how
            people actually use it.
          </p>
          <p className="body-copy">
            Automation Switch is a product of{' '}
            <a
              href="https://scaletific.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--amber)', textDecoration: 'none' }}
            >
              Scaletific
            </a>
            , which works across platform engineering, infrastructure, and enterprise automation.
            That background shapes how we think about the content. Everything here is grounded in
            production reality.
          </p>
        </div>
      </section>

      {/* STATS BAND */}
      <div className="stat-band">
        <div className="stat-band-inner">
          <div className="stat-band-item">
            <div className="stat-band-num">205+</div>
            <div className="stat-band-label">Skills Indexed</div>
          </div>
          <div className="stat-band-item">
            <div className="stat-band-num">11</div>
            <div className="stat-band-label">Agent Platforms</div>
          </div>
          <div className="stat-band-item">
            <div className="stat-band-num">9</div>
            <div className="stat-band-label">Skill Domains</div>
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
