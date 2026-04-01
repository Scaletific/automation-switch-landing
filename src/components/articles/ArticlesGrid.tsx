'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { getArticleHref } from '@/lib/pillars'
import type { Article } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export function ArticlesGrid({ articles }: { articles: Article[] }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  // Extract unique categories from articles
  const categories = useMemo(() => {
    const cats = articles
      .map(a => a.category?.title)
      .filter(Boolean) as string[]
    return Array.from(new Set(cats))
  }, [articles])

  const filtered = useMemo(() => {
    return articles.filter(a => {
      const matchCat = activeCategory === 'all' || a.category?.title === activeCategory
      const matchSearch = !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.excerpt ?? '').toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [articles, activeCategory, search])

  const [featured, second, third, ...rest] = filtered

  return (
    <>
      {/* Filter bar */}
      <div className="articles-filter-bar">
        <div className="articles-filter-inner">
          <div className="articles-filter-pills">
            <button
              className={`filter-btn${activeCategory === 'all' ? ' active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="articles-search-wrap">
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="articles-search"
              aria-label="Search articles"
            />
            <span className="articles-search-icon">⌕</span>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="articles-section">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--border)', letterSpacing: '0.04em', marginBottom: '10px' }}>
              No articles found
            </div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
              Try a different filter or search term
            </p>
          </div>
        ) : (
          <>
            {/* Featured row — first article large left, next two in sidebar */}
            {featured && (
              <div className="articles-featured-row">
                <Link href={getArticleHref(featured)} className="article-card-featured">
                  {featured.category && (
                    <div className="article-category">{featured.category.title}</div>
                  )}
                  {featured.kicker && <div className="article-kicker">{featured.kicker}</div>}
                  <h2 className="article-card-feat-title">{featured.title}</h2>
                  {featured.excerpt && (
                    <p className="article-excerpt">{featured.excerpt}</p>
                  )}
                  <div className="article-meta">
                    <span>{formatDate(featured.publishedAt)}</span>
                    {featured.readTime && (
                      <>
                        <div className="article-meta-dot" />
                        <span>{featured.readTime} min read</span>
                      </>
                    )}
                    <div className="article-meta-dot" />
                    <span>Automation Switch</span>
                  </div>
                </Link>

                {(second || third) && (
                  <div className="featured-side">
                    {second && (
                      <Link href={getArticleHref(second)} className="featured-side-item">
                        {second.category && (
                          <div className="article-category">{second.category.title}</div>
                        )}
                        <div className="article-title">{second.title}</div>
                        <div className="article-meta" style={{ marginTop: '10px' }}>
                          <span>{formatDate(second.publishedAt)}</span>
                          {second.readTime && (
                            <><div className="article-meta-dot" /><span>{second.readTime} min</span></>
                          )}
                        </div>
                      </Link>
                    )}
                    {third && (
                      <Link href={getArticleHref(third)} className="featured-side-item">
                        {third.category && (
                          <div className="article-category">{third.category.title}</div>
                        )}
                        <div className="article-title">{third.title}</div>
                        <div className="article-meta" style={{ marginTop: '10px' }}>
                          <span>{formatDate(third.publishedAt)}</span>
                          {third.readTime && (
                            <><div className="article-meta-dot" /><span>{third.readTime} min</span></>
                          )}
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Rest of articles — 3-col grid */}
            {rest.length > 0 && (
              <div className="article-grid" style={{ marginTop: '1px' }}>
                {rest.map(a => (
                  <Link key={a._id} href={getArticleHref(a)} className="article-grid-item">
                    {a.category && (
                      <div className="article-category">{a.category.title}</div>
                    )}
                    {a.kicker && <div className="article-kicker">{a.kicker}</div>}
                    <div className="article-grid-title">{a.title}</div>
                    {a.excerpt && (
                      <div className="article-grid-excerpt">{a.excerpt}</div>
                    )}
                    <div className="article-grid-meta">
                      <span>{formatDate(a.publishedAt)}</span>
                      {a.readTime && (
                        <><span>·</span><span>{a.readTime} min</span></>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
