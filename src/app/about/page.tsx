import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Automation Switch',
  description: 'Automation Switch builds tools, writes playbooks, and connects the workflows that keep organisations running.',
}

export default function AboutPage() {
  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Who we are</div>
        <h1 className="page-title-xl">ABOUT</h1>
        <p className="page-sub">
          Automation Switch is a growing resource for businesses that want to work smarter.
        </p>
      </div>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">WHAT WE ARE BUILDING</h2>
        </div>

        <div className="mission" style={{ margin: '0 0 48px', maxWidth: '100%' }}>
          <div className="mission-eyebrow">The mission</div>
          <div className="mission-text">
            We build the tools and write<br />
            the playbooks so <em>you do not</em><br />
            have to figure it out alone.
          </div>
          <p className="mission-sub">
            Automation Switch is a growing resource for businesses that want to work smarter.
            We build practical tools, publish honest breakdowns of what works,
            and connect the workflows that keep organisations running.
          </p>
        </div>

        <div className="tools-grid" style={{ marginTop: '48px' }}>
          <div className="tool-card" style={{ cursor: 'default' }}>
            <div className="tool-icon">📝</div>
            <div className="tool-name">ARTICLES</div>
            <p className="tool-desc">
              Deep dives, tool guides, and strategy breakdowns on automation, workflow design, and connected systems.
              Written for practitioners, not theorists.
            </p>
          </div>
          <div className="tool-card" style={{ cursor: 'default' }}>
            <div className="tool-icon">⚙️</div>
            <div className="tool-name">TOOLS</div>
            <p className="tool-desc">
              Practical AI-powered tools built around real workflow problems. From cold email research to webhook inspection.
              Built fast, shipped early.
            </p>
          </div>
          <div className="tool-card" style={{ cursor: 'default' }}>
            <div className="tool-icon">📂</div>
            <div className="tool-name">SKILLS HUB</div>
            <p className="tool-desc">
              The canonical index of SKILL.md sources for AI coding agents.
              We curate the list — the content lives at the source.
            </p>
          </div>
        </div>
      </section>

      {/* Contact / Newsletter CTA */}
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
              One email when something worth knowing lands.
              Tool releases, articles, and honest takes on what is working in automation right now.
            </p>
          </div>
          <div>
            <a
              href="https://x.com/automationswitch"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ display: 'block', marginBottom: '12px', textAlign: 'center' }}
            >
              Follow on X →
            </a>
            <a
              href="https://linkedin.com/company/automationswitch"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              style={{ display: 'block', textAlign: 'center' }}
            >
              LinkedIn →
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
