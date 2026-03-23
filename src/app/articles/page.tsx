import Link from 'next/link'
import { client } from '@sanity/lib/client'
import { allArticlesQuery } from '@sanity/lib/queries'
import type { Article } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Automation guides, workflow breakdowns, and tool deep-dives from Automation Switch.',
}

export const revalidate = 60

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export default async function ArticlesPage() {
  const articles = await client.fetch<Article[]>(allArticlesQuery)
  const [featured, ...rest] = articles ?? []

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">From the archive</div>
        <h1 className="page-title">ARTICLES</h1>
        <div className="count-badge">{articles?.length ?? 0} pieces</div>
      </div>

      <section className="section">
        {!articles?.length ? (
          <p style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dim)' }}>No articles yet — check back soon.</p>
        ) : (
          <>
            {featured && (
              <div className="featured-grid" style={{ marginBottom: '1px' }}>
                <Link href={`/articles/${featured.slug.current}`} className="featured-main" style={{ textDecoration: 'none' }}>
                  <div className="article-category">{featured.category?.title}</div>
                  <h2 className="article-title-large">{featured.title}</h2>
                  <p className="article-excerpt">{featured.excerpt}</p>
                  <div className="article-meta">
                    <span>{formatDate(featured.publishedAt)}</span>
                    {featured.readTime && <><div className="article-meta-dot" /><span>{featured.readTime} min read</span></>}
                  </div>
                </Link>
                <div className="featured-side">
                  {rest.slice(0, 2).map(a => (
                    <Link key={a._id} href={`/articles/${a.slug.current}`} className="featured-side-item" style={{ textDecoration: 'none' }}>
                      <div className="article-category">{a.category?.title}</div>
                      <div className="article-title">{a.title}</div>
                      <div className="article-meta" style={{ marginTop: '10px' }}>
                        <span>{formatDate(a.publishedAt)}</span>
                        {a.readTime && <><div className="article-meta-dot" /><span>{a.readTime} min</span></>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {rest.length > 2 && (
              <div className="articles-list">
                {rest.slice(2).map((a, i) => (
                  <Link key={a._id} href={`/articles/${a.slug.current}`} className="article-row">
                    <div className="article-num">0{i + 1}</div>
                    <div>
                      <div className="article-row-title">{a.title}</div>
                      <div className="article-row-meta">{formatDate(a.publishedAt)}{a.readTime ? ` · ${a.readTime} min read` : ''}{a.category ? ` · ${a.category.title}` : ''}</div>
                    </div>
                    <div className="article-row-arrow">→</div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
