import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms governing use of the Automation Switch website, tools, and content.',
  robots: { index: false },
}

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-page-inner">
        <div className="legal-page-header">
          <div className="page-eyebrow">Legal</div>
          <h1 className="page-title-xl">TERMS OF USE</h1>
          <p className="legal-meta">Last updated: March 2026</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>Acceptance of terms</h2>
            <p>By accessing or using the Automation Switch website at <strong>automationswitch.com</strong> (&ldquo;Site&rdquo;) or any tools, newsletters, or services we provide (&ldquo;Services&rdquo;), you agree to be bound by these Terms of Use (&ldquo;Terms&rdquo;). If you do not agree, do not use the Site or Services.</p>
            <p>These Terms apply to all visitors, subscribers, and contributors. We reserve the right to update these Terms at any time. Continued use of the Site after changes constitutes acceptance.</p>
          </section>

          <section className="legal-section">
            <h2>About Automation Switch</h2>
            <p>Automation Switch is an independent publisher providing guides, tools, and a skills directory for professionals working with AI agents and automation workflows. We are based in the United Kingdom.</p>
          </section>

          <section className="legal-section">
            <h2>Use of the Site</h2>
            <p>You may use the Site and its content for personal, non-commercial purposes. You agree not to:</p>
            <ul>
              <li>Reproduce, redistribute, or resell any content without written permission</li>
              <li>Use the Site for unlawful purposes or in violation of any applicable law</li>
              <li>Attempt to gain unauthorised access to any part of our infrastructure</li>
              <li>Use automated scraping tools against the Site in a manner that degrades performance</li>
              <li>Submit false, misleading, or malicious content through any form or submission mechanism</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Intellectual property</h2>
            <p>All content on the Site, including articles, guides, tool descriptions, code examples, and visual assets, is owned by Automation Switch or its contributors and is protected by copyright.</p>
            <p>You may quote short excerpts from our content for commentary or educational purposes, provided you clearly attribute Automation Switch and link to the original source. Full reproduction requires written permission.</p>
            <p>The Automation Switch name, logo, and brand marks are our trademarks. You may not use them without prior written consent.</p>
          </section>

          <section className="legal-section">
            <h2>Newsletter</h2>
            <p>By subscribing to our newsletter, you consent to receiving periodic emails about automation, AI agents, and related topics. You may unsubscribe at any time using the link included in every email.</p>
            <p>We do not use your email address for purposes beyond the newsletter without your separate consent.</p>
          </section>

          <section className="legal-section">
            <h2>Skills directory submissions</h2>
            <p>When you submit a skill source to our directory, you confirm that:</p>
            <ul>
              <li>You have the right to submit the resource and any associated information</li>
              <li>The submission does not infringe any third-party intellectual property rights</li>
              <li>The resource is not malicious, harmful, or deceptive</li>
            </ul>
            <p>By submitting, you grant Automation Switch a non-exclusive, royalty-free licence to list, display, and describe the submitted resource within the Skills directory. We reserve the right to reject, edit, or remove any submission at our discretion.</p>
          </section>

          <section className="legal-section">
            <h2>Third-party tools and links</h2>
            <p>The Site links to and references third-party tools including PrecisionReach and external services. These are operated independently of Automation Switch. We are not responsible for the content, availability, or practices of third-party sites.</p>
            <p>Any reference to a third-party tool, service, or product is for informational purposes and does not constitute an endorsement or warranty.</p>
          </section>

          <section className="legal-section">
            <h2>Disclaimer of warranties</h2>
            <p>The Site and all content are provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We do not warrant that:</p>
            <ul>
              <li>The Site will be uninterrupted or error-free</li>
              <li>Any content is complete, accurate, or up to date</li>
              <li>Any tool, workflow, or technique described will produce specific results</li>
            </ul>
            <p>Automation guides and tool recommendations are based on our experience and judgement at the time of writing. Outcomes vary. Always test workflows in a safe environment before deploying to production.</p>
          </section>

          <section className="legal-section">
            <h2>Limitation of liability</h2>
            <p>To the fullest extent permitted by law, Automation Switch shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Site, its content, or any linked services. This includes loss of data, revenue, or business.</p>
            <p>Our total liability for any claim arising out of these Terms shall not exceed £100.</p>
          </section>

          <section className="legal-section">
            <h2>Governing law</h2>
            <p>These Terms are governed by the laws of England and Wales. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          <section className="legal-section">
            <h2>Contact</h2>
            <p>For questions about these Terms:</p>
            <p><strong>Email:</strong> legal@automationswitch.com<br />
            <strong>Website:</strong> automationswitch.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}
