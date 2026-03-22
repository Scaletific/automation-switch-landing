import Link from 'next/link'
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
    <Link href={`/articles/${article.slug.current}`} className="no-underline">
      <div className={`card-hover-bar bg-[#1e1e1e] hover:bg-[#252525] transition-colors cursor-pointer ${size === 'side' ? 'p-6' : 'p-7'} h-full`}>
        <div className="font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.14em] text-[#c8861a] mb-2">
          {article.category?.title}
        </div>
        {size === 'side' ? (
          <div className="text-[15px] font-medium leading-[1.4] text-[#e8e8e8] mb-2">{article.title}</div>
        ) : (
          <div className="font-['Bebas_Neue'] text-[24px] leading-[1.0] tracking-[0.03em] text-[#e8e8e8] mb-2">{article.title}</div>
        )}
        {size === 'grid' && article.excerpt && (
          <p className="text-[13px] font-light leading-[1.7] text-[#b0b0b0] mb-4">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-3 font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.1em] text-[#707070] mt-2">
          <span>{formatDate(article.publishedAt)}</span>
          {article.readTime && (
            <>
              <span className="w-[3px] h-[3px] rounded-full bg-[#707070]" />
              <span>{article.readTime} min</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
