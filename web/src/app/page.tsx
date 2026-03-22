import { client } from '../../sanity/lib/client'
import { homepageArticlesQuery, toolsQuery } from '../../sanity/lib/queries'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { FeaturedArticle } from '@/components/articles/FeaturedArticle'
import { ToolCard } from '@/components/home/ToolCard'
import { SubscribeForm } from '@/components/ui/SubscribeForm'
import { Ticker } from '@/components/home/Ticker'
import type { Article, Tool } from '@/lib/types'

export const revalidate = 60

export default async function HomePage() {
  const [{ featured, latest }, tools] = await Promise.all([
    client.fetch<{ featured: Article; latest: Article[] }>(homepageArticlesQuery),
    client.fetch<Tool[]>(toolsQuery),
  ])

  return (
    <>
      <Ticker />

      {/* HERO */}
      <section className="max-w-[1200px] mx-auto px-10 pt-20 pb-16 grid grid-cols-[1fr_360px] gap-20 items-start">
        <div>
          <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#c8861a] mb-5 flex items-center gap-2 animate-fade-up animate-delay-1">
            <span className="block w-6 h-px bg-[#c8861a]" />
            Automation Intelligence
          </div>
          <h1 className="font-['Bebas_Neue'] text-[clamp(64px,8vw,108px)] leading-[0.92] tracking-[0.02em] text-[#e8e8e8] mb-7 animate-fade-up animate-delay-2">
            FLIP THE<br />
            <span className="text-[#c8861a]">SWITCH.</span>
          </h1>
          <p className="text-[16px] font-light leading-[1.8] text-[#b0b0b0] max-w-[480px] mb-9 animate-fade-up animate-delay-3">
            Tools, insights, and connected workflows for businesses that move fast.
            We build automation infrastructure so your team can focus on what actually matters.
          </p>
          <div className="flex items-center gap-5 animate-fade-up animate-delay-4">
            <a href="/tools" className="font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-[0.1em] text-white bg-[#c8861a] px-7 py-3 no-underline hover:opacity-85 transition-opacity">
              Explore Tools
            </a>
            <a href="/articles" className="font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-[0.1em] text-[#707070] no-underline hover:text-[#e8e8e8] transition-colors">
              Read Articles →
            </a>
          </div>
        </div>

        {/* SUBSCRIBE SIDEBAR */}
        <div id="subscribe" className="border-l border-[#3a3a3a] pl-10 pt-2 animate-fade-up animate-delay-3">
          <div className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.14em] text-[#707070] mb-4">
            Stay in the loop
          </div>
          <SubscribeForm />
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto h-px bg-[#3a3a3a]" />

      {/* FEATURED ARTICLES */}
      <section className="max-w-[1200px] mx-auto px-10 py-16" id="articles">
        <div className="flex items-baseline justify-between mb-9 pb-4 border-b border-[#3a3a3a]">
          <h2 className="font-['Bebas_Neue'] text-[32px] tracking-[0.06em] text-[#e8e8e8]">LATEST ARTICLES</h2>
          <a href="/articles" className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.12em] text-[#c8861a] no-underline hover:underline">
            All Articles →
          </a>
        </div>

        {featured || (latest && latest.length > 0) ? (
          <div className="grid grid-cols-[2fr_1fr] gap-px bg-[#3a3a3a]">
            {featured && <FeaturedArticle article={featured} />}
            <div className="flex flex-col gap-px bg-[#3a3a3a]">
              {latest?.slice(0, 2).map(article => (
                <ArticleCard key={article._id} article={article} size="side" />
              ))}
            </div>
          </div>
        ) : (
          <p className="font-['IBM_Plex_Mono'] text-[12px] text-[#707070]">Articles coming soon.</p>
        )}
      </section>

      {/* TOOLS */}
      <section className="max-w-[1200px] mx-auto px-10 py-16 border-t border-[#3a3a3a]" id="tools">
        <div className="flex items-baseline justify-between mb-9 pb-4 border-b border-[#3a3a3a]">
          <h2 className="font-['Bebas_Neue'] text-[32px] tracking-[0.06em] text-[#e8e8e8]">TOOLS</h2>
          <a href="/tools" className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.12em] text-[#c8861a] no-underline hover:underline">
            All Tools →
          </a>
        </div>
        {tools?.length > 0 ? (
          <div className="grid grid-cols-3 gap-px bg-[#3a3a3a]">
            {tools.map(tool => <ToolCard key={tool._id} tool={tool} />)}
          </div>
        ) : (
          <p className="font-['IBM_Plex_Mono'] text-[12px] text-[#707070]">Tools coming soon.</p>
        )}
      </section>

      {/* MISSION */}
      <div className="max-w-[1200px] mx-auto px-10 pb-20">
        <div className="bg-[#252525] border border-[#3a3a3a] px-14 py-14 relative overflow-hidden">
          <span className="absolute top-0 left-0 w-[3px] h-full bg-[#c8861a]" />
          <div className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.16em] text-[#c8861a] mb-5">
            Our Mission
          </div>
          <p className="font-['Bebas_Neue'] text-[clamp(28px,3.5vw,46px)] leading-[1.1] tracking-[0.02em] text-[#e8e8e8] max-w-[800px]">
            AUTOMATION SWITCH HELPS BUSINESSES MOVE FROM{' '}
            <span className="text-[#c8861a]">AI CURIOSITY</span> TO PRACTICAL AUTOMATION THROUGH WORKFLOW DESIGN, AGENTIC SYSTEMS, AND IMPLEMENTATION SUPPORT.
          </p>
          <p className="mt-6 text-[14px] font-light leading-[1.8] text-[#b0b0b0] max-w-[560px]">
            Part of the Scaletific family. Built for businesses that want to move faster without hiring more people.
          </p>
        </div>
      </div>
    </>
  )
}
