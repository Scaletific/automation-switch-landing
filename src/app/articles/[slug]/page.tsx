import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@sanity/lib/client'
import { articleFullBySlugQuery, allArticlesQuery } from '@sanity/lib/queries'
import { PortableText } from '@portabletext/react'
import { SubscribeForm } from '@/components/ui/SubscribeForm'
import type { ArticleFull, Article } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateStaticParams() {
  const articles = await client.fetch<Article[]>(allArticlesQuery)
  return articles?.map(a => ({ slug: a.slug.current })) ?? []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await client.fetch<ArticleFull>(articleFullBySlugQuery, { slug })
  if (!article) return {}
  return {
    title: article.seo?.metaTitle ?? article.title,
    description: article.seo?.metaDescription ?? article.excerpt,
    robots: article.seo?.noIndex ? { index: false } : undefined,
    alternates: article.seo?.canonicalUrl ? { canonical: article.seo.canonicalUrl } : undefined,
    openGraph: {
      title: article.seo?.metaTitle ?? article.title,
      description: article.seo?.metaDescription ?? article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.lastModified ?? article.publishedAt,
      authors: article.author ? [article.author.name] : undefined,
      images: article.heroImage?.url ? [{ url: article.heroImage.url }] : undefined,
    },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await client.fetch<ArticleFull>(articleFullBySlugQuery, { slug })
  if (!article) notFound()

  const siteUrl = 'https://automationswitch.com'
  const articleUrl = `${siteUrl}/articles/${article.slug.current}`

  // JSON-LD: Article schema
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
        url: `https://automationswitch.com/authors/${article.author.slug.current}`,
        sameAs: [
          ...(article.author.linkedinUrl ? [article.author.linkedinUrl] : []),
          'https://scaletific.com',
        ],
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: 'Automation Switch',
      url: siteUrl,
    },
    ...(article.keyTakeaways?.length && {
      about: article.keyTakeaways.map(t => ({ '@type': 'Thing', name: t })),
    }),
  }

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `${siteUrl}/articles` },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
    ],
  }

  // JSON-LD: FAQPage (only if FAQ exists)
  const faqJsonLd = article.faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null

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
            <Link href="/articles">Articles</Link>
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
            {article.kicker && (
              <div className="article-kicker">{article.kicker}</div>
            )}
            <h1 className="article-page-title">{article.title}</h1>
            {article.excerpt && <p className="article-page-excerpt">{article.excerpt}</p>}

            {/* Author byline */}
            {article.author && (
              <Link href={`/authors/${article.author.slug.current}`} className="author-byline">
                <div className="author-avatar">
                  {article.author.avatar?.url ? (
                    <Image
                      src={article.author.avatar.url}
                      alt={article.author.name}
                      width={36}
                      height={36}
                    />
                  ) : (
                    <div className="author-avatar-placeholder">
                      {article.author.name.charAt(0)}
                    </div>
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
            {article.body ? (
              <PortableText value={article.body as Parameters<typeof PortableText>[0]['value']} />
            ) : (
              <p style={{ color: 'var(--text-dim)' }}>Content coming soon.</p>
            )}
          </div>

          {/* FAQ */}
          {article.faq && article.faq.length > 0 && (
            <div className="article-faq">
              <div className="faq-label">Frequently asked questions</div>
              {article.faq.map(item => (
                <div key={item._key} className="faq-item" onClick={e => {
                  (e.currentTarget as HTMLElement).classList.toggle('open')
                }}>
                  <button className="faq-question">
                    <span className="faq-question-text">{item.question}</span>
                    <span className="faq-chevron">↓</span>
                  </button>
                  <div className="faq-answer">{item.answer}</div>
                </div>
              ))}
            </div>
          )}

          {/* Author bio — bottom of main content */}
          {article.author && (
            <div className="author-bio-card author-bio-card--inline">
              <div className="author-bio-avatar">
                {article.author.avatar?.url ? (
                  <Image
                    src={article.author.avatar.url}
                    alt={article.author.name}
                    width={64}
                    height={64}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: '22px', color: 'var(--amber)' }}>
                    {article.author.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="author-bio-label">Written by</div>
                <Link href={`/authors/${article.author.slug.current}`} className="author-bio-name">{article.author.name}</Link>
                <div className="author-bio-role">{article.author.role}</div>
                {article.author.bio && (
                  <p className="author-bio-text">{article.author.bio}</p>
                )}
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
          {/* Article info stats */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Article info</div>
            <div className="sidebar-stats-grid">
              {article.readTime && (
                <>
                  <div className="sidebar-stat">
                    <div className="sidebar-stat-value">{article.readTime}</div>
                    <div className="sidebar-stat-label">Min read</div>
                  </div>
                </>
              )}
              <div className="sidebar-stat">
                <div className="sidebar-stat-value">{new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
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
    </>
  )
}
