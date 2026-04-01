import Link from 'next/link'
import { notFound } from 'next/navigation'
import { client } from '@sanity/lib/client'
import { glossaryTermBySlugQuery, allGlossaryTermsQuery } from '@sanity/lib/queries'
import { getArticleHref } from '@/lib/pillars'
import type { GlossaryTermFull, GlossaryTerm } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 60

/* ------------------------------------------------------------------ */
/*  Static param generation                                           */
/* ------------------------------------------------------------------ */

export async function generateStaticParams() {
  const terms = await client.fetch<GlossaryTerm[]>(allGlossaryTermsQuery)
  return (terms ?? []).map(t => ({ slug: t.slug.current }))
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                          */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const term = await client.fetch<GlossaryTermFull>(glossaryTermBySlugQuery, { slug })
  if (!term) return {}

  const siteUrl = 'https://automationswitch.com'
  const termUrl = `${siteUrl}/glossary/${slug}`

  return {
    title: term.term,
    description: term.definition,
    alternates: { canonical: termUrl },
    openGraph: {
      title: term.term,
      description: term.definition,
      type: 'website',
    },
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

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
    'workflow-automation': 'Workflow Automation',
    'ai-workflows': 'AI Workflows',
    'tool-comparisons': 'Tool Comparisons',
    'automation-audits': 'Automation Audits',
    'hyperautomation': 'Hyperautomation',
    'production-readiness': 'Production Readiness',
  }
  return labels[pillar ?? ''] || 'General'
}

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const term = await client.fetch<GlossaryTermFull>(glossaryTermBySlugQuery, { slug })

  if (!term) notFound()

  const siteUrl = 'https://automationswitch.com'
  const termUrl = `${siteUrl}/glossary/${term.slug.current}`

  /* ---- JSON-LD --------------------------------------------------- */

  const definedTermJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.definition,
    url: termUrl,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Automation Switch Glossary',
      url: `${siteUrl}/glossary`,
    },
  }

  /* ---- Render ---------------------------------------------------- */

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }} />

      <div className="glossary-term-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href="/glossary">Glossary</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{term.term}</span>
        </nav>

        {/* Header */}
        <div className="glossary-term-header">
          <h1 className="glossary-term-title">{term.term}</h1>
          {term.pillar && (
            <div className={`glossary-pillar-badge-large ${pillarColor(term.pillar)}`}>
              {pillarLabel(term.pillar)}
            </div>
          )}
        </div>

        {/* Definition */}
        <div className="glossary-term-content">
          <p className="glossary-term-definition-full">{term.definition}</p>

          {/* Related terms */}
          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <section className="glossary-term-section">
              <h2 className="glossary-term-section-title">Related Terms</h2>
              <div className="glossary-related-terms">
                {term.relatedTerms.map(rt => (
                  <Link
                    key={rt.slug.current}
                    href={`/glossary/${rt.slug.current}`}
                    className="glossary-related-term-link"
                  >
                    {rt.term}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related articles */}
          {term.relatedArticles && term.relatedArticles.length > 0 && (
            <section className="glossary-term-section">
              <h2 className="glossary-term-section-title">Related Articles</h2>
              <div className="glossary-related-articles">
                {term.relatedArticles.map(article => (
                  <Link
                    key={article.slug.current}
                    href={getArticleHref(article)}
                    className="glossary-related-article-link"
                  >
                    <span className="glossary-related-article-title">{article.title}</span>
                    {article.primaryPillar && (
                      <span className="glossary-related-article-pillar">{article.primaryPillar}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Back to glossary */}
        <div className="glossary-term-footer">
          <Link href="/glossary" className="glossary-back-link">
            ← Back to Glossary
          </Link>
        </div>
      </div>
    </>
  )
}
