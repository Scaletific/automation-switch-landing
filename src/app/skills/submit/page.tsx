'use client'

import Link from 'next/link'
import { useState } from 'react'

const PLATFORMS = ['Claude Code', 'Cursor', 'Copilot', 'Gemini CLI', 'Aider', 'Windsurf', 'Generic']
const DOMAINS = ['Engineering', 'DevOps', 'Product', 'Data', 'Marketing', 'Design', 'General']

export default function SkillsSubmitPage() {
  const [form, setForm] = useState({
    name: '',
    url: '',
    description: '',
    platforms: [] as string[],
    domains: [] as string[],
    submitterEmail: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function toggleArray(field: 'platforms' | 'domains', value: string) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/skills/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (status === 'success') {
    return (
      <div className="page-header" style={{ textAlign: 'center', padding: '80px 40px' }}>
        <div className="page-eyebrow" style={{ justifyContent: 'center' }}>Submitted</div>
        <h1 className="page-title" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>THANKS FOR<br /><span style={{ color: 'var(--amber)' }}>THE TIP</span></h1>
        <p className="page-sub" style={{ margin: '0 auto 32px', textAlign: 'center' }}>
          We&apos;ll review the source and add it to the index if it meets our quality bar.
          Usually 48–72 hours.
        </p>
        <Link href="/skills" className="btn-primary">← Back to directory</Link>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href="/skills">Skills Hub</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Submit</span>
        </nav>
        <div className="page-eyebrow">Community</div>
        <h1 className="page-title">SUBMIT<br /><span style={{ color: 'var(--amber)' }}>A SOURCE</span></h1>
        <p className="page-sub">
          Know a high-quality SKILL.md collection we haven&apos;t indexed?
          Submit it here. Editorial review before publishing.
        </p>
      </div>

      <section className="section" style={{ maxWidth: '760px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '8px' }}>
              Source name <span style={{ color: 'var(--text-dim)' }}>*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. vercel-labs/agent-skills"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="subscribe-form"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text-bright)', fontFamily: 'var(--mono)', fontSize: '12px', padding: '12px 14px', outline: 'none', width: '100%', display: 'block' }}
            />
          </div>

          {/* URL */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '8px' }}>
              URL <span style={{ color: 'var(--text-dim)' }}>*</span>
            </label>
            <input
              required
              type="url"
              placeholder="https://github.com/org/repo"
              value={form.url}
              onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text-bright)', fontFamily: 'var(--mono)', fontSize: '12px', padding: '12px 14px', outline: 'none', width: '100%', display: 'block' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '8px' }}>
              Description <span style={{ color: 'var(--text-dim)' }}>*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="What does this source contain and who is it for?"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text-bright)', fontFamily: 'var(--sans)', fontSize: '13px', padding: '12px 14px', outline: 'none', width: '100%', resize: 'vertical', lineHeight: 1.7 }}
            />
          </div>

          {/* Platforms */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '8px' }}>
              Platforms
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleArray('platforms', p.toLowerCase().replace(/ \//g, '-').replace(/ /g, '-'))}
                  className={`skill-pill${form.platforms.includes(p.toLowerCase().replace(/ \//g, '-').replace(/ /g, '-')) ? ' active' : ''}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Domains */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '8px' }}>
              Domains
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {DOMAINS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleArray('domains', d.toLowerCase())}
                  className={`skill-pill${form.domains.includes(d.toLowerCase()) ? ' active' : ''}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '8px' }}>
              Your email <span style={{ color: 'var(--text-dim)' }}>(optional, for follow-up)</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.submitterEmail}
              onChange={e => setForm(p => ({ ...p, submitterEmail: e.target.value }))}
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text-bright)', fontFamily: 'var(--mono)', fontSize: '12px', padding: '12px 14px', outline: 'none', width: '100%', display: 'block' }}
            />
          </div>

          {status === 'error' && (
            <div style={{ background: 'rgba(200,80,80,0.08)', border: '1px solid rgba(200,80,80,0.3)', padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '11px', color: '#e07070' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={status === 'submitting'}
              style={{ opacity: status === 'submitting' ? 0.6 : 1, cursor: status === 'submitting' ? 'wait' : 'pointer' }}
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit source →'}
            </button>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
              Editorial review · 48–72h
            </span>
          </div>

        </form>
      </section>
    </>
  )
}
