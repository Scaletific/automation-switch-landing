import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact | Automation Switch',
  description: 'Get in touch with the Automation Switch team. Questions about workflow automation, tool feedback, or partnership enquiries.',
  alternates: { canonical: 'https://automationswitch.com/contact' },
  openGraph: {
    title: 'Contact | Automation Switch',
    description: 'Get in touch with the Automation Switch team.',
    url: 'https://automationswitch.com/contact',
    siteName: 'Automation Switch',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <>
      <div className="ticker-wrap ticker-wrap--light">
        <div className="ticker-inner">
          <span>Get In Touch</span><span className="ticker-sep">///</span>
          <span className="accent">Automation Switch</span><span className="ticker-sep">///</span>
          <span>Workflow Questions</span><span className="ticker-sep">///</span>
          <span className="accent">Built by Scaletific</span><span className="ticker-sep">///</span>
          <span>Get In Touch</span><span className="ticker-sep">///</span>
          <span className="accent">Automation Switch</span><span className="ticker-sep">///</span>
          <span>Workflow Questions</span><span className="ticker-sep">///</span>
          <span className="accent">Built by Scaletific</span><span className="ticker-sep">///</span>
        </div>
      </div>

      <section style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: 'clamp(48px, 8vw, 96px) 24px',
      }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--amber)',
          marginBottom: '20px',
        }}>
          Contact
        </div>

        <h1 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(32px, 5vw, 56px)',
          letterSpacing: '0.02em',
          lineHeight: 1.05,
          color: 'var(--text-bright)',
          marginBottom: '20px',
        }}>
          GET IN<br />
          <span style={{ color: 'var(--amber)' }}>TOUCH.</span>
        </h1>

        <p style={{
          fontSize: '14px',
          fontWeight: 300,
          lineHeight: 1.8,
          color: 'var(--text)',
          marginBottom: '48px',
          maxWidth: '480px',
        }}>
          Questions about workflow automation, tool feedback, partnership enquiries,
          or anything else. We read every message.
        </p>

        <ContactForm />
      </section>
    </>
  )
}
