import { redirect, notFound } from 'next/navigation'
import { client } from '@sanity/lib/client'
import { allArticlesQuery } from '@sanity/lib/queries'
import { groq } from 'next-sanity'
import { isValidPillar } from '@/lib/pillars'
import type { Metadata } from 'next'

/**
 * Legacy article route — /articles/[slug]
 *
 * Articles now live at /<pillar>/<slug>.  This route looks up the
 * article's primary pillar and issues a permanent redirect.
 *
 * If the article has no pillar set yet it still renders a 404 so we
 * don't serve content at two different URLs (bad for SEO).
 */

export const revalidate = 60

const pillarBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    primaryPillar,
    "slug": slug.current
  }
`

export async function generateStaticParams() {
  // Generate params for articles that DON'T have a pillar yet
  // (those with a pillar are served by /[pillar]/[slug] instead).
  // We still need this so Next.js knows the route exists for redirecting.
  const articles = await client.fetch<{ slug: { current: string }; primaryPillar?: string }[]>(allArticlesQuery)
  return (articles ?? []).map(a => ({ slug: a.slug.current }))
}

export async function generateMetadata(): Promise<Metadata> {
  // No metadata needed — this page always redirects
  return { robots: { index: false } }
}

export default async function LegacyArticleRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const article = await client.fetch<{ primaryPillar?: string; slug: string }>(
    pillarBySlugQuery,
    { slug },
  )

  if (!article) notFound()

  if (article.primaryPillar && isValidPillar(article.primaryPillar)) {
    redirect(`/${article.primaryPillar}/${article.slug}`)
  }

  // Article exists but has no pillar assigned yet — 404 to avoid
  // serving duplicate content.  Assign a pillar in Sanity to fix.
  notFound()
}
