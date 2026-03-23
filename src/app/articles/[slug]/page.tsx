import Link from 'next/link'
import { notFound } from 'next/navigation'
import { client } from '@sanity/lib/client'
import { articleBySlugQuery, allArticlesQuery } from '@sanity/lib/queries'
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
    <div className="article-page">
      <div>
        <div className="article-header">
          <div className="article-page-category">
            <Link href="/articles" style={{ color: 'var(--amber)', textDecoration: 'none' }}>Articles</Link>
            {' / '}
            {article.category?.title}
          </div>
          <h1 className="article-page-title">{article.title}</h1>
          {article.excerpt && <p className="article-page-excerpt">{article.excerpt}</p>}
          <div className="article-page-meta">
            <span>Automation Switch</span>
            <span>{formatDate(article.publishedAt)}</span>
            {article.readTime && <span>{article.readTime} min read</span>}
          </div>
        </div>

        <div className="article-body">
          {article.body ? (
            <PortableText value={article.body as Parameters<typeof PortableText>[0]['value']} />
          ) : (
            <p style={{ color: 'var(--text-dim)' }}>Content coming soon.</p>
          )}
        </div>
      </div>

      <aside className="sidebar-sticky">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Stay in the loop</div>
          <SubscribeForm compact />
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-title">Try our tools</div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            AI-powered cold email research and generation. Research an industry, build ICPs, and write targeted emails in one run.
          </p>
          <a href="https://precisionreach.automationswitch.com" target="_blank" rel="noreferrer" className="sidebar-tool-link">
            Try PrecisionReach →
          </a>
        </div>
      </aside>
    </div>
  )
}
