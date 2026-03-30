'use client'

import { useForm, ValidationError } from '@formspree/react'

export default function ContactForm() {
  const [state, handleSubmit] = useForm('xkopralo')

  if (state.succeeded) {
    return (
      <div style={{
        padding: '32px',
        border: '1px solid #22c55e',
        background: 'rgba(34, 197, 94, 0.06)',
      }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#22c55e',
          marginBottom: '12px',
        }}>
          Message received
        </div>
        <p style={{ fontSize: '14px', fontWeight: 300, lineHeight: 1.8, color: 'var(--text)' }}>
          Thanks for reaching out. We will get back to you at team@automationswitch.com shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="email" style={{
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-mid)',
        }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          placeholder="your@email.com"
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            color: 'var(--text-bright)',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            padding: '12px 14px',
            outline: 'none',
            width: '100%',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <ValidationError field="email" errors={state.errors} style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#f87171' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="message" style={{
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-mid)',
        }}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="What's on your mind?"
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            color: 'var(--text-bright)',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            padding: '12px 14px',
            outline: 'none',
            width: '100%',
            resize: 'vertical',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <ValidationError field="message" errors={state.errors} style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#f87171' }} />
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          background: 'var(--amber)',
          color: '#fff',
          border: 'none',
          padding: '14px',
          cursor: state.submitting ? 'not-allowed' : 'pointer',
          opacity: state.submitting ? 0.7 : 1,
          transition: 'opacity 0.2s',
          alignSelf: "stretch",
          width: "100%",
        }}
      >
        {state.submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
