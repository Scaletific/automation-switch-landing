import Link from 'next/link'
import type { Article } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export function FeaturedArticle({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug.current}`} className="no-underline">
      <div className="bg-[#1e1e1e] p-9 cursor-pointer hover:bg-[#252525] transition-colors h-full">
        <div className="font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.14em] text-[#c8861a] mb-2">
          {article.category?.title} · Deep Dive
        </div>
        <h3 className="font-['Bebas_Neue'] text-[34px] leading-[1.0] tracking-[0.03em] text-[#e8e8e8] mb-3">
          {article.title}
        </h3>
        <p className="text-[13px] font-light leading-[1.7] text-[#b0b0b0] mb-4">{article.excerpt}</p>
        <div className="flex items-center gap-4 font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.1em] text-[#707070]">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-[#707070]" />
          {article.readTime && <span>{article.readTime} min read</span>}
          <span className="w-[3px] h-[3px] rounded-full bg-[#707070]" />
          <span>Automation Switch</span>
        </div>
      </div>
    </Link>
  )
}
