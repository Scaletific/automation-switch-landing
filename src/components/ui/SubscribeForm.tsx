'use client'

import { useState } from 'react'

export function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="subscribe-form">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === 'success'}
      />
      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        style={status === 'success' ? {
          background: '#22c55e',
          color: '#fff',
          transition: 'background 0.3s ease',
          cursor: 'default',
        } : undefined}
      >
        {status === 'loading' ? 'Subscribing...' : status === 'success' ? "✓ You're in" : "Subscribe — It's Free"}
      </button>
      {status === 'error' && (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#f87171' }}>Something went wrong. Try again.</p>
      )}
      {status === 'success' && (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#22c55e', lineHeight: 1.6, marginTop: '8px' }}>
          You are subscribed. Check your inbox to confirm.
        </p>
      )}
      {status !== 'success' && (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-mid)', lineHeight: 1.6, marginTop: '8px' }}>
          One email per week. No spam. Unsubscribe any time. By subscribing you agree to our{' '}
          <a href="/privacy" style={{ color: 'var(--amber)', textDecoration: 'underline' }}>Privacy Policy</a>.
        </p>
      )}
    </form>
  )
}
