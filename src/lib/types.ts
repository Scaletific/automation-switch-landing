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
  primaryPillar?: string | null
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

export interface CalloutBoxBlock { _type: 'calloutBox'; _key: string; variant: 'info' | 'tip' | 'warning' | 'danger'; title?: string; body: string }
export interface ProConListBlock { _type: 'proConList'; _key: string; title?: string; pros: string[]; cons: string[] }
export interface HowToStepItem { _key: string; title: string; description: string }
export interface HowToStepsBlock { _type: 'howToSteps'; _key: string; title?: string; steps: HowToStepItem[] }
export interface CodeBlockBlock { _type: 'codeBlock'; _key: string; language?: string; code: string; filename?: string }
export interface StatHighlightBlock { _type: 'statHighlight'; _key: string; figure: string; label: string; source?: string; context?: string }

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

export interface PricingTier {
  name: string
  price: string
  description?: string
}

export interface ToolReview {
  _id: string
  name: string
  slug: { current: string }
  tagline: string
  category: string
  overallRating: number
  publishedAt: string
}

export interface ToolReviewFull extends ToolReview {
  featuredImage?: { asset?: { url?: string }; alt?: string }
  externalUrl?: string
  affiliateUrl?: string
  verdict: string
  pros: string[]
  cons: string[]
  pricingTiers?: PricingTier[]
  bestFor?: string
  lastTestedAt?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
}

export interface GlossaryTerm {
  _id: string
  term: string
  slug: { current: string }
  definition: string
  pillar?: string
}

export interface GlossaryTermFull extends GlossaryTerm {
  relatedTerms?: Array<{ term: string; slug: { current: string } }>
  relatedArticles?: Array<{ title: string; slug: { current: string }; primaryPillar?: string }>
}
