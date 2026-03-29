'use client'

import { useState, useMemo } from 'react'
import type { SkillSource } from '@/lib/types'

const PLATFORMS = ['claude-code', 'cursor', 'copilot', 'gemini-cli', 'aider', 'windsurf']
const PLATFORM_LABELS: Record<string, string> = {
  'claude-code': 'Claude Code',
  'cursor': 'Cursor',
  'copilot': 'Copilot',
  'gemini-cli': 'Gemini CLI',
  'aider': 'Aider',
  'windsurf': 'Windsurf',
}
const TYPES = ['official', 'community', 'tooling', 'spec'] as const
const DOMAINS = ['engineering', 'devops', 'product', 'data', 'marketing', 'design', 'general']

function badgeClass(type: string) {
  const map: Record<string, string> = {
    official: 'badge-official',
    community: 'badge-community',
    tooling: 'badge-tooling',
    spec: 'badge-spec',
  }
  return `source-type-badge ${map[type] ?? 'badge-spec'}`
}

function Delta({ current, prev }: { current?: number; prev?: number }) {
  if (!current || !prev || current <= prev) return null
  const diff = current - prev
  return (
    <span className="count-delta">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M4 7V1M1 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      </svg>
      +{diff} this week
    </span>
  )
}

function CopyInstall({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(cmd).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`card-install${copied ? ' copied' : ''}`} onClick={handleCopy} style={copied ? { borderColor: 'var(--amber)' } : {}}>
      <span className="card-install-text">{copied ? 'Copied!' : cmd}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="3" width="7" height="8" stroke="currentColor" strokeWidth="1"/>
        <path d="M4 3V2h7v7H9" stroke="currentColor" strokeWidth="1"/>
      </svg>
    </div>
  )
}

function SkillCard({ source }: { source: SkillSource }) {
  const deltaCount = source.skillCountPrev != null && source.skillCount != null
    && source.skillCount > source.skillCountPrev
    ? source.skillCount - source.skillCountPrev : null

  return (
    <a
      href={`/skills/${source.slug.current}`}
      className={`skill-card${source.featured ? ' featured' : ''}`}
    >
      <div className="card-header">
        <div className={badgeClass(source.sourceType)}>{source.sourceType}</div>
        {deltaCount != null && (
          <span className="count-delta">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M4 7V1M1 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
            </svg>
            +{deltaCount} this week
          </span>
        )}
      </div>

      <div className="card-name">{source.name}</div>
      <div className="card-desc">{source.description}</div>

      {source.platforms && source.platforms.length > 0 && (
        <div className="card-platforms">
          {source.platforms.map(p => (
            <span key={p} className="platform-tag">{PLATFORM_LABELS[p] ?? p}</span>
          ))}
        </div>
      )}

      {source.domains && source.domains.length > 0 && (
        <div className="card-domains">
          {source.domains.map((d, i) => (
            <span key={d}>
              {d}{i < (source.domains?.length ?? 0) - 1 && <span style={{ opacity: 0.4, margin: '0 5px' }}>·</span>}
            </span>
          ))}
        </div>
      )}

      {source.installCmd
        ? <CopyInstall cmd={source.installCmd} />
        : <div className="no-install">No install command — link only</div>
      }

      <div className="card-footer">
        <div className="card-skill-count">
          {source.skillCount != null
            ? <><strong>{source.skillCount}</strong> skills</>
            : source.sourceType === 'tooling' ? 'CLI tool' : 'Open source'
          }
        </div>
        <div className="card-view-link">View source →</div>
      </div>
    </a>
  )
}

export function SkillsGrid({ sources }: { sources: SkillSource[] }) {
  const [platform, setPlatform] = useState('all')
  const [type, setType] = useState('all')
  const [domain, setDomain] = useState('all')

  const filtered = useMemo(() => sources.filter(s => {
    const matchP = platform === 'all' || s.platforms?.includes(platform)
    const matchT = type === 'all' || s.sourceType === type
    const matchD = domain === 'all' || s.domains?.includes(domain)
    return matchP && matchT && matchD
  }), [sources, platform, type, domain])

  const featured = filtered.filter(s => s.featured)
  const rest = filtered.filter(s => !s.featured)

  return (
    <>
      {/* Filter bar */}
      <div className="filter-bar-wrap">
        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">Platform</span>
            <div className="filter-pills">
              <button className={`skill-pill${platform === 'all' ? ' active' : ''}`} onClick={() => setPlatform('all')}>All</button>
              {PLATFORMS.map(p => (
                <button key={p} className={`skill-pill${platform === p ? ' active' : ''}`} onClick={() => setPlatform(p)}>
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Type</span>
            <div className="filter-pills">
              <button className={`skill-pill${type === 'all' ? ' active' : ''}`} onClick={() => setType('all')}>All</button>
              {TYPES.map(t => (
                <button key={t} className={`skill-pill${type === t ? ' active' : ''}`} onClick={() => setType(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Domain</span>
            <div className="filter-pills">
              <button className={`skill-pill${domain === 'all' ? ' active' : ''}`} onClick={() => setDomain('all')}>All</button>
              {DOMAINS.map(d => (
                <button key={d} className={`skill-pill${domain === d ? ' active' : ''}`} onClick={() => setDomain(d)}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-count">Showing {filtered.length} source{filtered.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Content */}
      <div className="section" style={{ paddingTop: '32px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--border)', letterSpacing: '0.04em', marginBottom: '10px' }}>
              No sources found
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
              Try a different filter combination
            </div>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div style={{ marginBottom: '1px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '16px' }}>
                  // Featured Sources
                </div>
                <div className="skills-grid-2col">
                  {featured.map(s => <SkillCard key={s._id} source={s} />)}
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div style={{ marginTop: featured.length > 0 ? '1px' : 0 }}>
                {featured.length > 0 && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: '28px 0 16px' }}>
                    // All Sources
                  </div>
                )}
                <div className="skills-grid">
                  {rest.map(s => <SkillCard key={s._id} source={s} />)}
                </div>
              </div>
            )}
          </>
        )}

        {/* Submit banner */}
        <div className="skills-submit-banner">
          <div className="skills-submit-inner">
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '10px' }}>
                // Community
              </div>
              <div style={{ fontFamily: 'var(--display)', fontSize: '32px', letterSpacing: '0.04em', color: 'var(--text-bright)', lineHeight: 1.0, marginBottom: '10px' }}>
                KNOW A SOURCE<br />WE&apos;RE MISSING?
              </div>
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--text-dim)', maxWidth: '400px', lineHeight: 1.8 }}>
                Submit a repo, site, or CLI tool and we&apos;ll review it for the index.
                Quality over quantity — vetted sources only.
              </p>
            </div>
            <div>
              <a
                href="/skills/submit"
                className="btn-primary"
                style={{ display: 'inline-block', textDecoration: 'none' }}
              >
                Submit a source →
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
