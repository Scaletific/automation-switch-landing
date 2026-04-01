import Link from 'next/link'
import { notFound } from 'next/navigation'
import { client } from '@sanity/lib/client'
import { toolReviewBySlugQuery, allToolReviewsQuery } from '@sanity/lib/queries'
import { ProConList } from '@/components/articles/ProConList'
import type { ToolReviewFull, ToolReview } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 60

/* ------------------------------------------------------------------ */
/*  Static param generation                                           */
/* ------------------------------------------------------------------ */

export async function generateStaticParams() {
  const reviews = await client.fetch<ToolReview[]>(allToolReviewsQuery)
  return (reviews ?? []).map(r => ({ slug: r.slug.current }))
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
  const review = await client.fetch<ToolReviewFull>(toolReviewBySlugQuery, { slug })
  if (!review) return {}

  const siteUrl = 'https://automationswitch.com'
  const reviewUrl = `${siteUrl}/tools/${slug}`

  return {
    title: review.seo?.metaTitle ?? `${review.name} Review`,
    description: review.seo?.metaDescription ?? review.verdict,
    alternates: { canonical: reviewUrl },
    openGraph: {
      title: review.seo?.metaTitle ?? `${review.name} Review`,
      description: review.seo?.metaDescription ?? review.verdict,
      type: 'website',
      images: review.featuredImage?.asset?.url
        ? [{ url: `${review.featuredImage.asset.url}?w=1200&h=675&fit=crop&auto=format` }]
        : undefined,
    },
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  const filled = '★'.repeat(rounded)
  const empty = '☆'.repeat(5 - rounded)
  return <span>{filled}{empty}</span>
}

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default async function ToolReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const review = await client.fetch<ToolReviewFull>(toolReviewBySlugQuery, { slug })

  if (!review) notFound()

  const siteUrl = 'https://automationswitch.com'
  const reviewUrl = `${siteUrl}/tools/${review.slug.current}`

  /* ---- JSON-LD --------------------------------------------------- */

  const reviewJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: `${review.name} Review`,
    url: reviewUrl,
    author: {
      '@type': 'Organization',
      name: 'Automation Switch',
      url: siteUrl,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.overallRating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: review.verdict,
    datePublished: review.publishedAt,
    ...(review.lastTestedAt && { dateModified: review.lastTestedAt }),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${siteUrl}/tools` },
      { '@type': 'ListItem', position: 3, name: review.name, item: reviewUrl },
    ],
  }

  /* ---- Render ---------------------------------------------------- */

  const toolUrl = review.affiliateUrl || review.externalUrl

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="tool-review-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href="/tools">Tools</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{review.name}</span>
        </nav>

        {/* Header */}
        <div className="tool-review-header">
          {review.featuredImage?.asset?.url && (
            <div className="tool-review-featured-image">
              <img
                src={`${review.featuredImage.asset.url}?w=400&auto=format&q=80`}
                alt={review.featuredImage.alt ?? review.name}
                className="tool-review-image"
              />
            </div>
          )}
          <div className="tool-review-header-content">
            <h1 className="tool-review-title">{review.name}</h1>
            <p className="tool-review-tagline">{review.tagline}</p>

            {/* Rating */}
            <div className="tool-review-rating">
              <div className="tool-review-stars">
                <StarRating rating={review.overallRating} />
              </div>
              <span className="tool-review-rating-value">{review.overallRating.toFixed(1)}/5</span>
            </div>

            {/* Verdict */}
            <p className="tool-review-verdict">{review.verdict}</p>

            {/* CTA */}
            {toolUrl && (
              <a href={toolUrl} target="_blank" rel="noopener noreferrer" className="tool-review-cta">
                Visit {review.name} →
              </a>
            )}
          </div>
        </div>

        <div className="tool-review-content">
          {/* Pros & Cons */}
          {review.pros && review.cons && (
            <section className="tool-review-section">
              <h2 className="tool-review-section-title">Pros & Cons</h2>
              <ProConList pros={review.pros} cons={review.cons} />
            </section>
          )}

          {/* Pricing */}
          {review.pricingTiers && review.pricingTiers.length > 0 && (
            <section className="tool-review-section">
              <h2 className="tool-review-section-title">Pricing Tiers</h2>
              <table className="tool-review-pricing-table">
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Price</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {review.pricingTiers.map((tier, i) => (
                    <tr key={i}>
                      <td className="tool-review-pricing-name">{tier.name}</td>
                      <td className="tool-review-pricing-price">{tier.price}</td>
                      <td className="tool-review-pricing-desc">{tier.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Best For */}
          {review.bestFor && (
            <section className="tool-review-section tool-review-best-for">
              <div className="tool-review-best-for-label">Best For</div>
              <p className="tool-review-best-for-text">{review.bestFor}</p>
            </section>
          )}

          {/* Meta info */}
          <div className="tool-review-meta">
            <div className="tool-review-meta-item">
              <span className="tool-review-meta-label">Category:</span>
              <span className="tool-review-meta-value">{review.category}</span>
            </div>
            <div className="tool-review-meta-item">
              <span className="tool-review-meta-label">Published:</span>
              <span className="tool-review-meta-value">
                {new Date(review.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            {review.lastTestedAt && (
              <div className="tool-review-meta-item">
                <span className="tool-review-meta-label">Last tested:</span>
                <span className="tool-review-meta-value">
                  {new Date(review.lastTestedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
