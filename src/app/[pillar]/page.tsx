import Link from 'next/link'
import { notFound } from 'next/navigation'
import { client } from '@sanity/lib/client'
import { allArticlesQuery } from '@sanity/lib/queries'
import { isValidPillar, pillarLabel, getArticleHref, PILLAR_META } from '@/lib/pillars'
import { ArticlesGrid } from '@/components/articles/ArticlesGrid'
import type { Article } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 60

/* ------------------------------------------------------------------ */
/*  Pillar descriptions                                               */
/* ------------------------------------------------------------------ */

const PILLAR_DESCRIPTIONS: Record<string, string> = {
  'workflow-automation': 'Platforms, integrations, and operational patterns for teams that ship workflows.',
  'ai-workflows': 'AI agents, LLM pipelines, and intelligent automation for production systems.',
  'tool-comparisons': 'Unbiased, hands-on comparisons of automation platforms and developer tools.',
  'automation-audits': 'Frameworks, checklists, and diagnostic guides to assess automation readiness.',
  'hyperautomation': 'End-to-end automation strategy across tools, teams, and processes.',
  'production-readiness': 'Monitoring, observability, and reliability patterns for automated systems.',
}

/* ------------------------------------------------------------------ */
/*  Static param generation                                           */
/* ------------------------------------------------------------------ */

export async function generateStaticParams() {
  return Array.from({ length: 6 }, (_, i) => ({
    pillar: Object.keys(PILLAR_META)[i],
  }))
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                          */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string }>
}): Promise<Metadata> {
  const { pillar } = await params
  if (!isValidPillar(pillar)) return {}

  const label = pillarLabel(pillar)
  const description = PILLAR_DESCRIPTIONS[pillar]
  const siteUrl = 'https://automationswitch.com'
  const pillarUrl = `${siteUrl}/${pillar}`

  return {
    title: label,
    description,
    alternates: { canonical: pillarUrl },
    openGraph: {
      title: label,
      description,
      type: 'website',
      url: pillarUrl,
    },
  }
}

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default async function PillarLandingPage({
  params,
}: {
  params: Promise<{ pillar: string }>
}) {
  const { pillar } = await params

  // Validate pillar — return 404 for unrecognised prefixes
  if (!isValidPillar(pillar)) notFound()

  // Fetch all articles and filter by pillar
  const allArticles = await client.fetch<Article[]>(allArticlesQuery)
  const articles = (allArticles ?? [])
    .filter(a => a.primaryPillar === pillar)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const label = pillarLabel(pillar)
  const description = PILLAR_DESCRIPTIONS[pillar]
  const siteUrl = 'https://automationswitch.com'
  const pillarUrl = `${siteUrl}/${pillar}`

  /* ---- JSON-LD --------------------------------------------------- */

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: label,
    description,
    url: pillarUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          headline: article.title,
          description: article.excerpt,
          url: `${siteUrl}${getArticleHref(article)}`,
          datePublished: article.publishedAt,
          ...(article.category && {
            articleSection: article.category.title,
          }),
        },
      })),
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: label, item: pillarUrl },
    ],
  }

  /* ---- Render ---------------------------------------------------- */

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="pillar-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{label}</span>
        </nav>

        {/* Hero section */}
        <div className="pillar-hero">
          <h1 className="pillar-title">{label}</h1>
          <p className="pillar-description">{description}</p>
        </div>

        {/* Articles — reuses the same filter + grid as /articles */}
        <ArticlesGrid articles={articles} />
      </div>
    </>
  )
}
