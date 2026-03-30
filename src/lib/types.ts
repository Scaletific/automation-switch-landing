export interface Category {
  _id: string
  title: string
  slug: { current: string }
}

export interface Article {
  _id: string
  title: string
  kicker?: string
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

export interface Author {
  _id: string
  name: string
  slug: { current: string }
  role: string
  bio: string
  avatar?: { url: string }
  twitterUrl?: string
  linkedinUrl?: string
}

export interface FaqItem {
  _key: string
  question: string
  answer: string
}

export interface ArticleFull extends Article {
  related?: Article[]
  lastModified?: string
  tags?: string[]
  author?: Author
  heroImage?: { url: string; alt?: string }
  keyTakeaways?: string[]
  faq?: FaqItem[]
  body?: unknown[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    canonicalUrl?: string
    noIndex?: boolean
  }
}

export interface AuthorWithArticles extends Author {
  articles: Article[]
}

export interface SkillSource {
  _id: string
  name: string
  slug: { current: string }
  description: string
  url: string
  installCmd?: string
  domains?: string[]
  platforms?: string[]
  skillCount?: number
  skillCountPrev?: number
  skillCountUpdatedAt?: string
  sourceType: 'official' | 'community' | 'tooling' | 'spec'
  featured?: boolean
  status: 'published' | 'pending-review' | 'rejected'
  seo?: { metaTitle?: string; metaDescription?: string }
}
