import Link from 'next/link'
import { client } from '@sanity/lib/client'
import { allGlossaryTermsQuery } from '@sanity/lib/queries'
import type { GlossaryTerm } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Glossary',
  description: 'Automation and workflow terminology explained in plain language.',
}

export const revalidate = 60

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function groupTermsByFirstLetter(terms: GlossaryTerm[]) {
  const grouped: Record<string, GlossaryTerm[]> = {}

  terms.forEach(term => {
    const letter = term.term.charAt(0).toUpperCase()
    if (!grouped[letter]) grouped[letter] = []
    grouped[letter].push(term)
  })

  return grouped
}

function pillarColor(pillar?: string): string {
  const pillarMap: Record<string, string> = {
    'workflow-automation': 'glossary-pillar-workflow',
    'ai-workflows': 'glossary-pillar-ai',
    'tool-comparisons': 'glossary-pillar-tools',
    'automation-audits': 'glossary-pillar-audits',
    'hyperautomation': 'glossary-pillar-hyper',
    'production-readiness': 'glossary-pillar-prod',
  }
  return pillarMap[pillar ?? ''] || 'glossary-pillar-default'
}

function pillarLabel(pillar?: string): string {
  const labels: Record<string, string> = {
    'workflow-automation': 'Workflow',
    'ai-workflows': 'AI',
    'tool-comparisons': 'Tools',
    'automation-audits': 'Audits',
    'hyperautomation': 'Hyper',
    'production-readiness': 'Ready',
  }
  return labels[pillar ?? ''] || 'General'
}

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default async function GlossaryPage() {
  const terms = await client.fetch<GlossaryTerm[]>(allGlossaryTermsQuery)
  const grouped = groupTermsByFirstLetter(terms ?? [])
  const letters = Object.keys(grouped).sort()

  return (
    <>
      <div className="glossary-page">
        {/* Page header */}
        <div className="glossary-page-header">
          <div className="page-eyebrow">Automation terminology</div>
          <h1 className="page-title-xl">GLOSSARY</h1>
          <p className="page-sub" style={{ maxWidth: '560px', marginTop: '12px' }}>
            Plain-language definitions of automation and workflow concepts. When you encounter unfamiliar terminology, look here.
          </p>
        </div>

        {/* Navigation anchors */}
        <nav className="glossary-nav">
          <div className="glossary-nav-label">Jump to:</div>
          <div className="glossary-nav-letters">
            {letters.map(letter => (
              <a key={letter} href={`#glossary-letter-${letter}`} className="glossary-nav-link">
                {letter}
              </a>
            ))}
          </div>
        </nav>

        {/* Terms by letter */}
        <div className="glossary-terms">
          {letters.map(letter => (
            <section key={letter} id={`glossary-letter-${letter}`} className="glossary-letter-section">
              <h2 className="glossary-letter-heading">{letter}</h2>
              <div className="glossary-terms-list">
                {grouped[letter].map(term => (
                  <Link
                    key={term._id}
                    href={`/glossary/${term.slug.current}`}
                    className="glossary-term-card"
                  >
                    <div className="glossary-term-card-header">
                      <h3 className="glossary-term-name">{term.term}</h3>
                      {term.pillar && (
                        <span className={`glossary-pillar-badge ${pillarColor(term.pillar)}`}>
                          {pillarLabel(term.pillar)}
                        </span>
                      )}
                    </div>
                    <p className="glossary-term-definition">{term.definition}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
