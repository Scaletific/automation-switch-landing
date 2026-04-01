import Link from 'next/link'
import { getArticleHref } from '@/lib/pillars'
import type { Article } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export function FeaturedArticle({ article }: { article: Article }) {
  return (
    <Link href={getArticleHref(article)} className="featured-main" style={{ textDecoration: 'none' }}>
      <div className="article-category">{article.category?.title}</div>
      <h3 className="article-title-large">{article.title}</h3>
      <p className="article-excerpt">{article.excerpt}</p>
      <div className="article-meta">
        <span>{formatDate(article.publishedAt)}</span>
        {article.readTime && <><div className="article-meta-dot" /><span>{article.readTime} min read</span></>}
        <div className="article-meta-dot" />
        <span>Automation Switch</span>
      </div>
    </Link>
  )
}
