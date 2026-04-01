import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Automation Switch collects, uses, and protects your personal data.',
  robots: { index: false },
}

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-page-inner">
        <div className="legal-page-header">
          <div className="page-eyebrow">Legal</div>
          <h1 className="page-title-xl">PRIVACY POLICY</h1>
          <p className="legal-meta">Last updated: March 2026</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>Who we are</h2>
            <p>Automation Switch (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website at <strong>automationswitch.com</strong>. We publish automation guides, operate a skills directory, and provide tools for teams building with AI and automation workflows.</p>
            <p>For the purposes of UK GDPR and the Data Protection Act 2018, Automation Switch is the data controller for personal data collected through this site.</p>
          </section>

          <section className="legal-section">
            <h2>What personal data we collect</h2>
            <h3>Newsletter subscriptions</h3>
            <p>When you subscribe to our newsletter, we collect your <strong>email address</strong>. This is the only personal data required. We do not ask for your name.</p>

            <h3>Skills directory submissions</h3>
            <p>When you submit a skill source to our directory via the submission form, we may collect:</p>
            <ul>
              <li>Your name or organisation name (optional)</li>
              <li>A URL for the submitted resource</li>
              <li>Any contact information you voluntarily provide</li>
            </ul>

            <h3>Usage data</h3>
            <p>We do not currently use third-party analytics services. We do not deploy tracking pixels, advertising cookies, or session recording tools.</p>

            <h3>Technical data</h3>
            <p>Our hosting infrastructure (Vercel) may log standard server access data including IP addresses and browser type. This is processed by Vercel under their own privacy policy and is not used by us for profiling or marketing.</p>
          </section>

          <section className="legal-section">
            <h2>How we use your data</h2>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Purpose</th>
                  <th>Legal basis (UK GDPR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Email address</td>
                  <td>Sending the weekly newsletter</td>
                  <td>Consent (Art. 6(1)(a))</td>
                </tr>
                <tr>
                  <td>Skills submission data</td>
                  <td>Reviewing and publishing skill sources</td>
                  <td>Legitimate interests (Art. 6(1)(f))</td>
                </tr>
                <tr>
                  <td>Server logs</td>
                  <td>Security and infrastructure operations</td>
                  <td>Legitimate interests (Art. 6(1)(f))</td>
                </tr>
              </tbody>
            </table>
            <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section className="legal-section">
            <h2>Third-party services</h2>
            <p>We use the following third-party services that may process data on our behalf:</p>
            <ul>
              <li><strong>Vercel</strong>: hosting and CDN. Processes server logs. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a></li>
              <li><strong>Sanity</strong>: content management system. Stores published article and tool data (not personal data). <a href="https://www.sanity.io/legal/privacy" target="_blank" rel="noopener noreferrer">Sanity Privacy Policy</a></li>
            </ul>
            <p>We use <strong>Next.js Google Fonts</strong> integration, which downloads and self-hosts font files at build time. No font requests are sent to Google servers at runtime.</p>
          </section>

          <section className="legal-section">
            <h2>Cookies</h2>
            <p>This site does not use non-essential cookies. We do not use advertising cookies, analytics cookies, or third-party tracking cookies.</p>
            <p>Our infrastructure may set strictly necessary session cookies required for technical operation. These do not track you across sites and expire at the end of your session.</p>
            <p>If we introduce analytics or other cookie-based services in the future, we will update this policy and obtain appropriate consent before doing so.</p>
          </section>

          <section className="legal-section">
            <h2>How long we keep your data</h2>
            <ul>
              <li><strong>Newsletter email addresses</strong>: retained until you unsubscribe or request deletion</li>
              <li><strong>Skills submissions</strong>: retained for as long as the submission is under review or published in the directory</li>
              <li><strong>Server logs</strong>: retained by Vercel in accordance with their data retention policy</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Your rights</h2>
            <p>Under UK GDPR, you have the right to:</p>
            <ul>
              <li><strong>Access</strong>: request a copy of the personal data we hold about you</li>
              <li><strong>Rectification</strong>: request correction of inaccurate data</li>
              <li><strong>Erasure</strong>: request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
              <li><strong>Restriction</strong>: request we restrict processing of your data</li>
              <li><strong>Portability</strong>: request your data in a portable format</li>
              <li><strong>Object</strong>: object to processing based on legitimate interests</li>
              <li><strong>Withdraw consent</strong>: unsubscribe from the newsletter at any time using the link in any email we send you</li>
            </ul>
            <p>To exercise any of these rights, contact us at <strong>privacy@automationswitch.com</strong>. We will respond within 30 days.</p>
            <p>You also have the right to lodge a complaint with the <strong>Information Commissioner&apos;s Office (ICO)</strong> at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.</p>
          </section>

          <section className="legal-section">
            <h2>Children&apos;s data</h2>
            <p>This site is not directed at children under 16. We do not knowingly collect personal data from children. If you believe we have inadvertently collected data from a child, contact us immediately at privacy@automationswitch.com.</p>
          </section>

          <section className="legal-section">
            <h2>Changes to this policy</h2>
            <p>We may update this privacy policy from time to time. Material changes will be noted with an updated &ldquo;Last updated&rdquo; date at the top of this page. Continued use of the site after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section className="legal-section">
            <h2>Contact</h2>
            <p>For any privacy-related questions or requests:</p>
            <p><strong>Email:</strong> privacy@automationswitch.com<br />
            <strong>Website:</strong> automationswitch.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}
