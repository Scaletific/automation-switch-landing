import Link from 'next/link'
import { getArticleHref } from '@/lib/pillars'
import type { Article } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

interface Props {
  article: Article
  size?: 'side' | 'grid'
}

export function ArticleCard({ article, size = 'grid' }: Props) {
  return (
    <Link href={getArticleHref(article)} className="featured-side-item">
      <div className="article-category">{article.category?.title}</div>
      {article.kicker && <div className="article-kicker">{article.kicker}</div>}
      {size === 'side' ? (
        <div className="article-title">{article.title}</div>
      ) : (
        <div className="article-title-large">{article.title}</div>
      )}
      {size === 'grid' && article.excerpt && (
        <p className="article-excerpt">{article.excerpt}</p>
      )}
      <div className="article-meta">
        <span>{formatDate(article.publishedAt)}</span>
        {article.readTime && (
          <><div className="article-meta-dot" /><span>{article.readTime} min</span></>
        )}
      </div>
    </Link>
  )
}
