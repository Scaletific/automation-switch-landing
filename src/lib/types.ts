export interface Category {
  _id: string
  title: string
  slug: { current: string }
}

export interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  publishedAt: string
  readTime?: number
  featured?: boolean
  category: { title: string; slug: { current: string } }
  body?: unknown[]
  seo?: { metaTitle?: string; metaDescription?: string }
}

export interface Tool {
  _id: string
  name: string
  slug: { current: string }
  tagline: string
  description?: string
  icon?: string
  url?: string | null
  status: 'live' | 'soon' | 'beta'
}
