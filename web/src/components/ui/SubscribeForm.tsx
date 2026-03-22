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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="bg-[#1e1e1e] border border-[#3a3a3a] text-[#e8e8e8] font-['IBM_Plex_Mono'] text-[12px] px-3 py-3 outline-none w-full focus:border-[#c8861a] transition-colors placeholder:text-[#707070]"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.1em] bg-[#c8861a] text-white border-none py-3 cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
      >
        {status === 'loading' ? 'Subscribing...' : status === 'success' ? '✓ You\'re in' : 'Subscribe — It\'s Free'}
      </button>
      {status === 'error' && (
        <p className="font-['IBM_Plex_Mono'] text-[10px] text-red-400">Something went wrong. Try again.</p>
      )}
      {!compact && (
        <p className="font-['IBM_Plex_Mono'] text-[10px] text-[#707070] leading-relaxed mt-1">
          Automation guides, tool releases, and workflow breakdowns. No noise. Unsubscribe anytime.
        </p>
      )}
    </form>
  )
}
