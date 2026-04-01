import type { MetadataRoute } from 'next'
import { client } from '@sanity/lib/client'
import { groq } from 'next-sanity'

const BASE_URL = 'https://automationswitch.com'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE_URL}/articles`,  lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE_URL}/skills`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
  { url: `${BASE_URL}/tools`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/about`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/contact`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.5 },
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, skillSources, authors] = await Promise.all([
    client.fetch<{ slug: string; publishedAt?: string; lastModified?: string }[]>(articlesQuery),
    client.fetch<{ slug: string; skillCountUpdatedAt?: string }[]>(skillSourcesQuery),
    client.fetch<{ slug: string }[]>(authorsQuery),
  ])

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${BASE_URL}/articles/${a.slug}`,
    lastModified: a.lastModified ? new Date(a.lastModified) : a.publishedAt ? new Date(a.publishedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const skillRoutes: MetadataRoute.Sitemap = (skillSources ?? []).map((s) => ({
    url: `${BASE_URL}/skills/${s.slug}`,
    lastModified: s.skillCountUpdatedAt ? new Date(s.skillCountUpdatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const authorRoutes: MetadataRoute.Sitemap = (authors ?? []).map((a) => ({
    url: `${BASE_URL}/authors/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...articleRoutes, ...skillRoutes, ...authorRoutes]
}
