import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Automation Audits — AutomationSwitch',
  description:
    'Frameworks, diagnostics, and review guides for auditing your automation stack. Identify gaps, reduce risk, and build a roadmap toward production-ready operations.',
}

export default function AuditsPage() {
  return (
    <main className="audits-page">
      <section className="audits-hero">
        <div className="audits-hero-inner">
          <div className="audits-eyebrow">First direct monetisation offer</div>
          <h1 className="audits-headline">Automation Audits</h1>
          <p className="audits-subhead">
            Frameworks, diagnostics, and review guides for auditing your automation stack.
            Identify gaps, reduce risk, and build a clear roadmap toward production-ready operations.
          </p>
          <div className="audits-cta-row">
            <Link href="/contact" className="audits-cta-primary">Book an Audit</Link>
            <Link href="/automation-audits" className="audits-cta-secondary">Read the guides →</Link>
          </div>
        </div>
      </section>

      <section className="audits-coming-soon">
        <div className="audits-cs-inner">
          <div className="audits-cs-badge">Coming soon</div>
          <p className="audits-cs-text">
            We&apos;re building a full audit methodology and self-assessment tool.
            In the meantime, explore our diagnostic articles or reach out directly
            to discuss a bespoke audit engagement.
          </p>
          <Link href="/automation-audits" className="audits-link">
            Browse audit guides →
          </Link>
        </div>
      </section>
    </main>
  )
}
