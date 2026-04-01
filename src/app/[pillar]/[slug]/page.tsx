import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@sanity/lib/client'
import { articleFullBySlugQuery, allArticlesQuery, relatedArticlesQuery, latestArticlesQuery } from '@sanity/lib/queries'
import { PortableText } from '@portabletext/react'
import { SubscribeForm } from '@/components/ui/SubscribeForm'
import { FaqAccordion } from '@/components/ui/FaqAccordion'
import { ComparisonTable } from '@/components/articles/ComparisonTable'
import { CalloutBox } from '@/components/articles/CalloutBox'
import { ProConList } from '@/components/articles/ProConList'
import { HowToSteps } from '@/components/articles/HowToSteps'
import { CodeBlock } from '@/components/articles/CodeBlock'
import { StatHighlight } from '@/components/articles/StatHighlight'
import { isValidPillar, pillarLabel, getArticleHref } from '@/lib/pillars'
import type { ArticleFull, Article } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 60

/* ------------------------------------------------------------------ */
/*  Static param generation                                           */
/* ------------------------------------------------------------------ */

export async function generateStaticParams() {
  const articles = await client.fetch<Article[]>(allArticlesQuery)
  return (articles ?? [])
    .filter(a => a.primaryPillar && isValidPillar(a.primaryPillar))
    .map(a => ({ pillar: a.primaryPillar!, slug: a.slug.current }))
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                          */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>
}): Promise<Metadata> {
  const { pillar, slug } = await params
  if (!isValidPillar(pillar)) return {}

  const article = await client.fetch<ArticleFull>(articleFullBySlugQuery, { slug })
  if (!article) return {}

  const siteUrl = 'https://automationswitch.com'
  const articleUrl = `${siteUrl}/${pillar}/${slug}`

  return {
    title: article.seo?.metaTitle ?? article.title,
    description: article.seo?.metaDescription ?? article.excerpt,
    robots: article.seo?.noIndex ? { index: false } : undefined,
    alternates: { canonical: article.seo?.canonicalUrl ?? articleUrl },
    openGraph: {
      title: article.seo?.metaTitle ?? article.title,
      description: article.seo?.metaDescription ?? article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.lastModified ?? article.publishedAt,
      authors: article.author ? [article.author.name] : undefined,
      images: article.heroImage?.url
        ? [{ url: `${article.heroImage.url}?w=1200&h=675&fit=crop&auto=format` }]
        : undefined,
    },
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Strip duplicate h1, key-takeaways section and FAQ section from body. */
function filterBody(
  body: unknown[] | undefined,
  hasTakeaways: boolean,
  hasFaq: boolean,
): unknown[] {
  if (!body) return []
  let inSection: 'none' | 'takeaways' | 'faq' = 'none'

  return (body as any[]).filter((block) => {
    if (block._type !== 'block') return inSection === 'none'
    if (block.style === 'h1') return false

    if (block.style === 'h2') {
      const text = (block.children?.[0]?.text ?? '').toLowerCase().trim()
      if (hasTakeaways && text.includes('key takeaway')) { inSection = 'takeaways'; return false }
      if (hasFaq && (text.includes('frequently asked') || text === 'faq')) { inSection = 'faq'; return false }
      if (inSection === 'takeaways') { inSection = 'none'; return true }
      if (inSection === 'faq') return false
      return true
    }

    if (inSection !== 'none') return false
    return true
  })
}

/* ------------------------------------------------------------------ */
/*  Portable Text renderers                                           */
/* ------------------------------------------------------------------ */

const portableTextComponents = {
  types: {
    comparisonTable: ({ value }: { value: {
      headline?: string
      tools?: Array<{ name: string; logo?: { asset?: { _ref?: string; url?: string } } }>
      rows?: Array<{ criteria: string; values: string[] }>
      bestFor?: string[]
      winnerIndex?: number
    } }) => {
      if (!value.tools || !value.rows) return null
      const tools = value.tools.map(t => {
        let logoUrl: string | undefined
        if (t.logo?.asset?.url) logoUrl = t.logo.asset.url
        else if (t.logo?.asset?._ref) {
          const ref = t.logo.asset._ref
          const [, hash, dimensions, ext] = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/) ?? []
          if (hash) logoUrl = `https://cdn.sanity.io/images/l4o4vshf/production/${hash}-${dimensions}.${ext}?w=48&auto=format&q=80`
        }
        return { name: t.name, logoUrl }
      })
      return (
        <ComparisonTable
          headline={value.headline}
          tools={tools}
          rows={value.rows}
          bestFor={value.bestFor}
          winnerIndex={value.winnerIndex}
        />
      )
    },
    calloutBox: ({ value }: { value: { variant?: 'info' | 'tip' | 'warning' | 'danger'; title?: string; body?: string } }) => (
      <CalloutBox variant={value.variant ?? 'info'} title={value.title} body={value.body ?? ''} />
    ),
    proConList: ({ value }: { value: { title?: string; pros?: string[]; cons?: string[] } }) => (
      <ProConList title={value.title} pros={value.pros ?? []} cons={value.cons ?? []} />
    ),
    howToSteps: ({ value }: { value: { title?: string; steps?: Array<{ _key: string; title: string; description: string }> } }) => (
      <HowToSteps title={value.title} steps={value.steps ?? []} />
    ),
    codeBlock: ({ value }: { value: { language?: string; code?: string; filename?: string } }) => (
      <CodeBlock language={value.language} code={value.code ?? ''} filename={value.filename} />
    ),
    statHighlight: ({ value }: { value: { figure?: string; label?: string; source?: string; context?: string } }) => (
      <StatHighlight figure={value.figure ?? ''} label={value.label ?? ''} source={value.source} context={value.context} />
    ),
    image: ({ value }: { value: { asset?: { _ref?: string; url?: string }; alt?: string } }) => {
      let src = value.asset?.url
      if (!src && value.asset?._ref) {
        const ref = value.asset._ref
        const [, hash, dimensions, ext] = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/) ?? []
        if (hash) {
          src = `https://cdn.sanity.io/images/l4o4vshf/production/${hash}-${dimensions}.${ext}`
        }
      }
      if (!src) return null
      return (
        <figure className="article-body-figure">
          <img
            src={`${src}?w=1200&auto=format&q=80`}
            alt={value.alt ?? ''}
            loading="lazy"
            className="article-body-image"
          />
          {value.alt && (
            <figcaption className="article-body-figcaption">{value.alt}</figcaption>
          )}
        </figure>
      )
    },
  },
}

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default async function PillarArticlePage({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>
}) {
  const { pillar, slug } = await params

  // Validate pillar — return 404 for unrecognised prefixes so this
  // catch-all doesn't swallow routes like /about, /tools, etc.
  if (!isValidPillar(pillar)) notFound()

  const article = await client.fetch<ArticleFull>(articleFullBySlugQuery, { slug })
  if (!article) notFound()

  // If the article's pillar doesn't match the URL, 404 rather than
  // serving duplicate content under the wrong prefix.
  if (article.primaryPillar && article.primaryPillar !== pillar) notFound()

  const sameCategoryRelated = article.category
    ? await client.fetch<Article[]>(relatedArticlesQuery, {
        slug,
        categorySlug: article.category.slug.current,
      })
    : []
  const related =
    sameCategoryRelated.length > 0
      ? sameCategoryRelated
      : await client.fetch<Article[]>(latestArticlesQuery, { slug })

  const filteredBody = filterBody(
    article.body as unknown[] | undefined,
    !!(article.keyTakeaways && article.keyTakeaways.length > 0),
    !!(article.faq && article.faq.length > 0),
  )

  const siteUrl = 'https://automationswitch.com'
  const articleUrl = `${siteUrl}/${pillar}/${article.slug.current}`

  /* ---- JSON-LD --------------------------------------------------- */

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    url: articleUrl,
    datePublished: article.publishedAt,
    dateModified: article.lastModified ?? article.publishedAt,
    image: article.heroImage?.url ?? undefined,
    ...(article.author && {
      author: {
        '@type': 'Person',
        name: article.author.name,
        jobTitle: article.author.role,
        url: `${siteUrl}/authors/${article.author.slug.current}`,
        sameAs: [
          ...(article.author.linkedinUrl ? [article.author.linkedinUrl] : []),
          'https://scaletific.com',
        ],
      },
    }),
    publisher: { '@type': 'Organization', name: 'Automation Switch', url: siteUrl },
    ...(article.keyTakeaways?.length && {
      about: article.keyTakeaways.map(t => ({ '@type': 'Thing', name: t })),
    }),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: pillarLabel(pillar), item: `${siteUrl}/${pillar}` },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
    ],
  }

  const faqJsonLd = article.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null

  /* ---- Render ---------------------------------------------------- */

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <div className="article-page">
        <div>
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span>{pillarLabel(pillar)}</span>
            <span className="breadcrumb-sep">/</span>
            {article.category && (
              <>
                <span>{article.category.title}</span>
                <span className="breadcrumb-sep">/</span>
              </>
            )}
            <span>{article.title}</span>
          </nav>

          {/* Header */}
          <div className="article-header">
            {article.category?.title && (
              <div className="article-page-category-pill">{article.category.title}</div>
            )}
            {article.kicker && <div className="article-kicker">{article.kicker}</div>}
            <h1 className="article-page-title">{article.title}</h1>
            {article.excerpt && <p className="article-page-excerpt">{article.excerpt}</p>}

            {/* Author byline */}
            {article.author && (
              <Link href={`/authors/${article.author.slug.current}`} className="author-byline">
                <div className="author-avatar">
                  {article.author.avatar?.url ? (
                    <Image src={article.author.avatar.url} alt={article.author.name} width={36} height={36} />
                  ) : (
                    <div className="author-avatar-placeholder">{article.author.name.charAt(0)}</div>
                  )}
                </div>
                <div className="author-byline-info">
                  <span className="author-byline-name">{article.author.name}</span>
                  <span className="author-byline-role">{article.author.role}</span>
                </div>
              </Link>
            )}

            <div className="article-page-meta">
              <span>{formatDate(article.publishedAt)}</span>
              {article.lastModified && article.lastModified !== article.publishedAt && (
                <span>Updated {formatDate(article.lastModified)}</span>
              )}
              {article.readTime && <span>{article.readTime} min read</span>}
              {article.category && <span>{article.category.title}</span>}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="article-tags">
                {article.tags.map(tag => (
                  <span key={tag} className="article-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Hero image */}
          {article.heroImage?.url && (
            <img
              src={article.heroImage.url}
              alt={article.heroImage.alt ?? article.title}
              className="article-hero-image"
            />
          )}

          {/* Key takeaways */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div className="key-takeaways">
              <div className="key-takeaways-label">Key takeaways</div>
              <ol>
                {article.keyTakeaways.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Body */}
          <div className="article-body">
            {filteredBody.length > 0 ? (
              <PortableText
                value={filteredBody as Parameters<typeof PortableText>[0]['value']}
                components={portableTextComponents}
              />
            ) : (
              <p style={{ color: 'var(--text-dim)' }}>Content coming soon.</p>
            )}
          </div>

          {/* FAQ */}
          {article.faq && article.faq.length > 0 && <FaqAccordion items={article.faq} />}

          {/* Author bio */}
          {article.author && (
            <div className="author-bio-card author-bio-card--inline">
              <div className="author-bio-avatar">
                {article.author.avatar?.url ? (
                  <Image src={article.author.avatar.url} alt={article.author.name} width={64} height={64} />
                ) : (
                  <div
                    style={{
                      width: '100%', height: '100%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--display)', fontSize: '22px', color: 'var(--amber)',
                    }}
                  >
                    {article.author.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="author-bio-label">Written by</div>
                <Link href={`/authors/${article.author.slug.current}`} className="author-bio-name">
                  {article.author.name}
                </Link>
                <div className="author-bio-role">{article.author.role}</div>
                {article.author.bio && <p className="author-bio-text">{article.author.bio}</p>}
                <div className="author-bio-links">
                  {article.author.twitterUrl && (
                    <a href={article.author.twitterUrl} target="_blank" rel="noopener noreferrer" className="author-bio-link">X</a>
                  )}
                  {article.author.linkedinUrl && (
                    <a href={article.author.linkedinUrl} target="_blank" rel="noopener noreferrer" className="author-bio-link">LinkedIn</a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="sidebar-sticky">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Article info</div>
            <div className="sidebar-stats-grid">
              {article.readTime && (
                <div className="sidebar-stat">
                  <div className="sidebar-stat-value">{article.readTime}</div>
                  <div className="sidebar-stat-label">Min read</div>
                </div>
              )}
              <div className="sidebar-stat">
                <div className="sidebar-stat-value">
                  {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
                <div className="sidebar-stat-label">{new Date(article.publishedAt).getFullYear()}</div>
              </div>
              {article.category && (
                <div className="sidebar-stat sidebar-stat--wide">
                  <div className="sidebar-stat-value sidebar-stat-value--sm">{article.category.title}</div>
                  <div className="sidebar-stat-label">Category</div>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Stay in the loop</div>
            <SubscribeForm compact />
          </div>

          <div className="sidebar-section sidebar-section--amber">
            <div className="sidebar-section-title sidebar-section-title--amber">From Automation Switch</div>
            <div className="sidebar-tool-name">PrecisionReach</div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '16px' }}>
              AI-powered cold email research and generation. Research an industry, build ICPs, and write targeted emails in one run.
            </p>
            <a href="https://precisionreach.automationswitch.com" className="sidebar-tool-cta">
              Try PrecisionReach →
            </a>
          </div>
        </aside>
      </div>

      {/* Related articles */}
      {related && related.length > 0 && (
        <section className="related-articles">
          <div className="related-articles-header">
            <span className="related-articles-label">Related Articles</span>
            <Link href="/articles" className="related-articles-all">View All →</Link>
          </div>
          <div className="related-articles-grid">
            {related.map(r => (
              <Link key={r._id} href={getArticleHref(r)} className="related-card">
                {r.category && <div className="related-cat">{r.category.title}</div>}
                {r.kicker && <div className="article-kicker">{r.kicker}</div>}
                <div className="related-title">{r.title}</div>
                {r.excerpt && <div className="related-excerpt">{r.excerpt}</div>}
                <div className="related-meta">
                  <span>{formatDate(r.publishedAt)}</span>
                  {r.readTime && <><span> · </span><span>{r.readTime} min</span></>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
