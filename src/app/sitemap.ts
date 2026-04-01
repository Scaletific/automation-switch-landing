import type { MetadataRoute } from 'next'
import { client } from '@sanity/lib/client'
import { groq } from 'next-sanity'
import { getRuntimeEnv } from '@/lib/runtime-env'

const BASE_URL = (getRuntimeEnv('NEXT_PUBLIC_SITE_URL') ?? 'https://automationswitch.com').replace(/\/+$/, '')
const NOW = new Date()

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`,                     lastModified: NOW, changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE_URL}/articles`,             lastModified: NOW, changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE_URL}/skills`,               lastModified: NOW, changeFrequency: 'weekly',  priority: 0.9 },
  { url: `${BASE_URL}/tools`,                lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/tools/audit`,          lastModified: NOW, changeFrequency: 'weekly',  priority: 0.75 },
  { url: `${BASE_URL}/tools/search-console`, lastModified: NOW, changeFrequency: 'weekly',  priority: 0.75 },
  { url: `${BASE_URL}/about`,                lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/contact`,              lastModified: NOW, changeFrequency: 'yearly',  priority: 0.5 },
]

const articlesQuery = groq`
  *[_type == "article" && defined(slug.current)] | order(publishedAt desc) {
    "slug": slug.current,
    publishedAt,
    lastModified
  }
`

const skillSourcesQuery = groq`
  *[_type == "skillSource" && status == "published" && defined(slug.current)] | order(name asc) {
    "slug": slug.current,
    skillCountUpdatedAt
  }
`

const authorsQuery = groq`
  *[_type == "author" && defined(slug.current)] {
    "slug": slug.current
  }
`

export const revalidate = 3600

function safeDate(value?: string): Date {
  if (!value) return NOW
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? NOW : date
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, skillSources, authors] = await Promise.all([
    client.fetch<{ slug: string; publishedAt?: string; lastModified?: string }[]>(articlesQuery).catch(() => []),
    client.fetch<{ slug: string; skillCountUpdatedAt?: string }[]>(skillSourcesQuery).catch(() => []),
    client.fetch<{ slug: string }[]>(authorsQuery).catch(() => []),
  ])

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${BASE_URL}/articles/${a.slug}`,
    lastModified: safeDate(a.lastModified ?? a.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const skillRoutes: MetadataRoute.Sitemap = (skillSources ?? []).map((s) => ({
    url: `${BASE_URL}/skills/${s.slug}`,
    lastModified: safeDate(s.skillCountUpdatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const authorRoutes: MetadataRoute.Sitemap = (authors ?? []).map((a) => ({
    url: `${BASE_URL}/authors/${a.slug}`,
    lastModified: NOW,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...articleRoutes, ...skillRoutes, ...authorRoutes]
}
