import { client } from '@sanity/lib/client'
import { allSkillSourcesQuery } from '@sanity/lib/queries'
import { SkillsGrid } from '@/components/skills/SkillsGrid'
import type { SkillSource } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 3600 // revalidate hourly (Firecrawl cron runs weekly)

export const metadata: Metadata = {
  title: 'Skills Hub | Agent Skill Sources Directory',
  description:
    'The canonical index of SKILL.md file sources for AI coding agents. Curated sources from official platforms, community collections, and tooling. Filterable by platform and domain.',
  openGraph: {
    title: 'Skills Hub | Automation Switch',
    description: 'The canonical index of SKILL.md file sources for AI coding agents.',
    type: 'website',
  },
}

export default async function SkillsPage() {
  const sources = await client.fetch<SkillSource[]>(allSkillSourcesQuery)

  const publishedCount = sources?.length ?? 0
  const totalSkills = sources?.reduce((sum, s) => sum + (s.skillCount ?? 0), 0) ?? 0

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Skills Hub | Agent Skill Sources Directory',
            description: 'Curated index of SKILL.md file sources for AI coding agents.',
            url: 'https://automationswitch.com/skills',
            publisher: {
              '@type': 'Organization',
              name: 'Automation Switch',
              url: 'https://automationswitch.com',
            },
          }),
        }}
      />

      {/* Ticker */}
      <div className="ticker-wrap ticker-wrap--light">
        <div className="ticker-inner">
          <span className="accent">// Skills Hub</span>
          <span>Curated agent skill sources</span>
          <span className="accent">·</span>
          <span>Claude Code · Cursor · Copilot · Gemini CLI · Aider</span>
          <span className="accent">·</span>
          <span>Official · Community · Tooling · Spec</span>
          <span className="accent">·</span>
          <span>We are the index. Not the database.</span>
          <span className="accent">·</span>
          <span>Know a source? Submit it ↗</span>
          <span className="accent">// Skills Hub</span>
          <span>Curated agent skill sources</span>
          <span className="accent">·</span>
          <span>Claude Code · Cursor · Copilot · Gemini CLI · Aider</span>
          <span className="accent">·</span>
          <span>Official · Community · Tooling · Spec</span>
          <span className="accent">·</span>
          <span>We are the index. Not the database.</span>
          <span className="accent">·</span>
          <span>Know a source? Submit it ↗</span>
        </div>
      </div>

      {/* Page header */}
      <div className="page-header" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: '40px' }}>
        <div>
          <div className="page-eyebrow">Agent Skills Directory</div>
          <h1 className="page-title">SKILLS<br /><span style={{ color: 'var(--amber)' }}>HUB</span></h1>
          <p className="page-sub">
            The canonical index of SKILL.md file sources for AI coding agents.
            We curate the list. The content lives at the source.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: '96px', color: 'var(--amber)', letterSpacing: '0.04em', lineHeight: 1 }}>
            {publishedCount}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '4px' }}>
            Vetted sources
          </div>
          {totalSkills > 0 && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px' }}>
              {totalSkills}+ skills indexed · Updated weekly
            </div>
          )}
        </div>
      </div>

      {/* Interactive grid with filters (client component) */}
      {!sources?.length ? (
        <div className="section" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: '32px', color: 'var(--border)', letterSpacing: '0.04em', marginBottom: '12px' }}>
            Coming soon
          </div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
            We&apos;re seeding the directory. Check back shortly.
          </p>
        </div>
      ) : (
        <SkillsGrid sources={sources} />
      )}
    </>
  )
}
