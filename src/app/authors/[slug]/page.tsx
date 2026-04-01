import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@sanity/lib/client'
import { authorBySlugQuery } from '@sanity/lib/queries'
import { getArticleHref } from '@/lib/pillars'
import type { AuthorWithArticles } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const author = await client.fetch<AuthorWithArticles>(authorBySlugQuery, { slug })
  if (!author) return {}
  return {
    title: `${author.name} | Automation Switch`,
    description: author.bio,
    openGraph: {
      title: `${author.name} | Automation Switch`,
      description: author.bio,
      url: `https://automationswitch.com/authors/${slug}`,
      siteName: 'Automation Switch',
      type: 'profile',
    },
    alternates: { canonical: `https://automationswitch.com/authors/${slug}` },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await client.fetch<AuthorWithArticles>(authorBySlugQuery, { slug })
  if (!author) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    url: `https://automationswitch.com/authors/${slug}`,
    ...(author.avatar?.url && { image: author.avatar.url }),
    sameAs: [
      ...(author.linkedinUrl ? [author.linkedinUrl] : []),
      'https://scaletific.com',
    ],
    worksFor: [
      {
        '@type': 'Organization',
        name: 'Automation Switch',
        url: 'https://automationswitch.com',
      },
      {
        '@type': 'Organization',
        name: 'Scaletific',
        url: 'https://scaletific.com',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* AUTHOR HERO */}
      <section className="author-hero">
        <div className="author-hero-avatar">
          {author.avatar?.url ? (
            <Image
              src={author.avatar.url}
              alt={author.name}
              width={120}
              height={120}
              className="author-hero-img"
            />
          ) : (
            <div className="author-hero-placeholder">{author.name.charAt(0)}</div>
          )}
        </div>
        <div className="author-hero-text">
          <div className="author-hero-eyebrow">Author</div>
          <h1 className="author-hero-name">{author.name}</h1>
          <div className="author-hero-role">{author.role}</div>
          {author.bio.split('\n\n').map((para, i) => (
            <p key={i} className="author-hero-bio">{para}</p>
          ))}
          <div className="author-hero-links">
            {author.linkedinUrl && (
              <a
                href={author.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                LinkedIn →
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ARTICLES BY THIS AUTHOR */}
      {author.articles && author.articles.length > 0 && (
        <>
          <div className="section-bar">
            <span className="section-bar-label">Articles by {author.name}</span>
          </div>
          <div className="article-grid">
            {author.articles.map(article => (
              <Link
                key={article._id}
                href={getArticleHref(article)}
                className="article-grid-item"
              >
                {article.category && (
                  <div className="article-category">{article.category.title}</div>
                )}
                {article.kicker && (
                  <div className="article-kicker">{article.kicker}</div>
                )}
                <div className="article-grid-title">{article.title}</div>
                {article.excerpt && (
                  <div className="article-grid-excerpt">{article.excerpt}</div>
                )}
                <div className="article-grid-meta">
                  <span>{formatDate(article.publishedAt)}</span>
                  {article.readTime && (
                    <><span>·</span><span>{article.readTime} min</span></>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  )
}
