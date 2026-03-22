import { client } from '../../../sanity/lib/client'
import { allArticlesQuery, categoriesQuery } from '../../../sanity/lib/queries'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { FeaturedArticle } from '@/components/articles/FeaturedArticle'
import type { Article, Category } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Automation guides, workflow breakdowns, and tool deep-dives from Automation Switch.',
}

export const revalidate = 60

export default async function ArticlesPage() {
  const [articles, categories] = await Promise.all([
    client.fetch<Article[]>(allArticlesQuery),
    client.fetch<Category[]>(categoriesQuery),
  ])

  const [featured, ...rest] = articles ?? []

  return (
    <>
      {/* PAGE HEADER */}
      <div className="max-w-[1200px] mx-auto px-10 pt-14 pb-9 flex items-end justify-between border-b border-[#3a3a3a]">
        <h1 className="font-['Bebas_Neue'] text-[56px] tracking-[0.04em] text-[#e8e8e8] leading-none">ARTICLES</h1>
        <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.1em] text-[#707070]">
          {articles?.length ?? 0} pieces
        </span>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-[1200px] mx-auto px-10 py-5 flex items-center gap-2 border-b border-[#3a3a3a] flex-wrap">
        <button className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 border border-[#c8861a] bg-[rgba(200,134,26,0.09)] text-[#c8861a] cursor-pointer">
          All
        </button>
        {categories?.map(cat => (
          <button
            key={cat._id}
            className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 border border-[#3a3a3a] bg-transparent text-[#707070] cursor-pointer hover:border-[#c8861a] hover:text-[#c8861a] transition-colors"
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* ARTICLES */}
      <div className="max-w-[1200px] mx-auto px-10 py-10">
        {articles?.length === 0 ? (
          <p className="font-['IBM_Plex_Mono'] text-[12px] text-[#707070]">No articles yet — check back soon.</p>
        ) : (
          <>
            {/* Featured row */}
            {featured && (
              <div className="grid grid-cols-[2fr_1fr] gap-px bg-[#3a3a3a] mb-px">
                <FeaturedArticle article={featured} />
                <div className="flex flex-col gap-px bg-[#3a3a3a]">
                  {rest.slice(0, 2).map(a => (
                    <ArticleCard key={a._id} article={a} size="side" />
                  ))}
                </div>
              </div>
            )}

            {/* Standard grid */}
            {rest.length > 2 && (
              <div className="grid grid-cols-3 gap-px bg-[#3a3a3a]">
                {rest.slice(2).map(a => (
                  <ArticleCard key={a._id} article={a} size="grid" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
