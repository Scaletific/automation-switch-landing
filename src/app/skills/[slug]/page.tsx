import Link from 'next/link'
import { notFound } from 'next/navigation'
import { client } from '@sanity/lib/client'
import { skillSourceBySlugQuery, allSkillSourcesQuery } from '@sanity/lib/queries'
import type { SkillSource } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 3600

const PLATFORM_LABELS: Record<string, string> = {
  'claude-code': 'Claude Code',
  'cursor': 'Cursor',
  'copilot': 'Copilot',
  'gemini-cli': 'Gemini CLI',
  'aider': 'Aider',
  'windsurf': 'Windsurf',
  'generic': 'Any / Generic',
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  official: 'Official',
  community: 'Community',
  tooling: 'Tooling / CLI',
  spec: 'Specification',
}

export async function generateStaticParams() {
  const sources = await client.fetch<SkillSource[]>(allSkillSourcesQuery)
  return sources?.map(s => ({ slug: s.slug.current })) ?? []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const source = await client.fetch<SkillSource>(skillSourceBySlugQuery, { slug })
  if (!source) return {}
  return {
    title: source.seo?.metaTitle ?? `${source.name} | Skills Hub`,
    description: source.seo?.metaDescription ?? source.description,
    openGraph: {
      title: source.seo?.metaTitle ?? `${source.name} | Skills Hub`,
      description: source.seo?.metaDescription ?? source.description,
      type: 'website',
    },
  }
}

function badgeClass(type: string) {
  const map: Record<string, string> = {
    official: 'badge-official',
    community: 'badge-community',
    tooling: 'badge-tooling',
    spec: 'badge-spec',
  }
  return `source-type-badge ${map[type] ?? 'badge-spec'}`
}

export default async function SkillSourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const source = await client.fetch<SkillSource>(skillSourceBySlugQuery, { slug })
  if (!source) notFound()

  const delta = (source.skillCount != null && source.skillCountPrev != null)
    ? source.skillCount - source.skillCountPrev : null

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `${source.name} | Skills Hub`,
            description: source.description,
            url: `https://automationswitch.com/skills/${source.slug.current}`,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://automationswitch.com' },
                { '@type': 'ListItem', position: 2, name: 'Skills Hub', item: 'https://automationswitch.com/skills' },
                { '@type': 'ListItem', position: 3, name: source.name },
              ],
            },
          }),
        }}
      />

      <div className="article-page">
        <div>
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href="/skills">Skills Hub</Link>
            <span className="breadcrumb-sep">/</span>
            <span>{source.name}</span>
          </nav>

          {/* Header */}
          <div className="article-header">
            <div className="article-page-category">
              <div className={badgeClass(source.sourceType)} style={{ display: 'inline-flex', marginBottom: '16px' }}>
                {SOURCE_TYPE_LABELS[source.sourceType]}
              </div>
            </div>
            <h1 className="article-page-title">{source.name}</h1>
            <p className="article-page-excerpt">{source.description}</p>

            {/* Stats row */}
            <div className="article-page-meta">
              {source.skillCount != null && (
                <span>
                  {source.skillCount} skills
                  {delta != null && delta > 0 && (
                    <span style={{ color: '#5dba8a', marginLeft: '6px' }}>↑ +{delta} recently</span>
                  )}
                </span>
              )}
              {source.sourceType && <span>{SOURCE_TYPE_LABELS[source.sourceType]}</span>}
            </div>
          </div>

          {/* Install command */}
          {source.installCmd && (
            <div style={{ marginBottom: '36px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>
                Install command
              </div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ flex: 1 }}>{source.installCmd}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  Copy
                </span>
              </div>
            </div>
          )}

          {/* Platforms */}
          {source.platforms && source.platforms.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>
                Compatible with
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {source.platforms.map(p => (
                  <span key={p} className="platform-tag">{PLATFORM_LABELS[p] ?? p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Domains */}
          {source.domains && source.domains.length > 0 && (
            <div style={{ marginBottom: '36px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>
                Domains covered
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {source.domains.map(d => (
                  <span key={d} className="article-tag">{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
              View source →
            </a>
            <Link href="/skills" className="btn-ghost">← Back to directory</Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="sidebar-sticky">
          <div className="sidebar-section">
            <div className="sidebar-section-title">About this source</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>Type</div>
                <div style={{ fontSize: '13px', color: 'var(--text-bright)' }}>{SOURCE_TYPE_LABELS[source.sourceType]}</div>
              </div>
              {source.skillCount != null && (
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>Skills</div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--amber)', letterSpacing: '0.04em' }}>{source.skillCount}</div>
                </div>
              )}
            </div>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="sidebar-tool-link">
              Visit source →
            </a>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Know a better source?</div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '12px' }}>
              If you know a high-quality skill collection we haven&apos;t indexed, submit it for review.
            </p>
            <Link href="/skills/submit" className="sidebar-tool-link" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Submit a source
            </Link>
          </div>
        </aside>
      </div>
    </>
  )
}
