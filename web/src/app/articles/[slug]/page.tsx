import { notFound } from 'next/navigation'
import { client } from '../../../../sanity/lib/client'
import { articleBySlugQuery, allArticlesQuery } from '../../../../sanity/lib/queries'
import { PortableText } from '@portabletext/react'
import { SubscribeForm } from '@/components/ui/SubscribeForm'
import type { Article } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateStaticParams() {
  const articles = await client.fetch<Article[]>(allArticlesQuery)
  return articles?.map(a => ({ slug: a.slug.current })) ?? []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await client.fetch<Article>(articleBySlugQuery, { slug })
  if (!article) return {}
  return {
    title: article.seo?.metaTitle ?? article.title,
    description: article.seo?.metaDescription ?? article.excerpt,
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await client.fetch<Article>(articleBySlugQuery, { slug })
  if (!article) notFound()

  return (
    <>
      {/* ARTICLE HEADER */}
      <div className="max-w-[800px] mx-auto px-10 pt-14 pb-10">
        <div className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#707070] mb-5 flex items-center gap-2">
          <a href="/articles" className="text-[#c8861a] no-underline hover:underline">Articles</a>
          <span>/</span>
          <span>{article.category?.title}</span>
        </div>
        <div className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.14em] text-[#c8861a] mb-4 flex items-center gap-2">
          <span className="block w-5 h-px bg-[#c8861a]" />
          {article.category?.title}
        </div>
        <h1 className="font-['Bebas_Neue'] text-[clamp(40px,5vw,64px)] leading-[0.95] tracking-[0.02em] text-[#e8e8e8] mb-6">
          {article.title}
        </h1>
        <div className="flex items-center gap-5 py-4 border-t border-b border-[#3a3a3a]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[rgba(200,134,26,0.09)] border border-[#8a5c10] flex items-center justify-center font-['IBM_Plex_Mono'] text-[10px] text-[#c8861a]">
              AS
            </div>
            <span className="text-[13px] font-medium text-[#e8e8e8]">Automation Switch</span>
          </div>
          <span className="w-[3px] h-[3px] rounded-full bg-[#3a3a3a]" />
          <span className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#707070]">{formatDate(article.publishedAt)}</span>
          {article.readTime && (
            <>
              <span className="w-[3px] h-[3px] rounded-full bg-[#3a3a3a]" />
              <span className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#707070]">{article.readTime} min read</span>
            </>
          )}
        </div>
      </div>

      {/* ARTICLE BODY + SIDEBAR */}
      <div className="max-w-[1100px] mx-auto px-10 pb-20 grid grid-cols-[1fr_280px] gap-16 items-start">
        <article className="prose prose-automationswitch max-w-none prose-lg">
          {article.body ? (
            <PortableText value={article.body as Parameters<typeof PortableText>[0]['value']} />
          ) : (
            <p className="text-[#707070]">Content coming soon.</p>
          )}
        </article>

        <aside className="sticky top-[72px] flex flex-col gap-5">
          <div className="bg-[#252525] border border-[#3a3a3a] p-6">
            <div className="font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.14em] text-[#707070] mb-3">Stay in the loop</div>
            <SubscribeForm compact />
          </div>
          <div className="bg-[#252525] border border-[#3a3a3a] p-6">
            <div className="font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.14em] text-[#707070] mb-4">Try our tools</div>
            <a
              href="https://precisionreach.automationswitch.com"
              target="_blank"
              rel="noreferrer"
              className="block font-['Bebas_Neue'] text-[18px] tracking-[0.04em] text-[#e8e8e8] no-underline hover:text-[#c8861a] transition-colors"
            >
              PrecisionReach →
            </a>
            <p className="text-[12px] text-[#707070] mt-1 leading-relaxed">
              AI-powered cold email research and generation.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
