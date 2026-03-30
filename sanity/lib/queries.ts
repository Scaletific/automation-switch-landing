import { groq } from 'next-sanity'

// Article fields shared across queries
const articleFields = groq`
  _id,
  title,
  kicker,
  slug,
  excerpt,
  publishedAt,
  readTime,
  featured,
  "category": category->{ title, slug }
`

// Homepage: featured article + 5 latest
export const homepageArticlesQuery = groq`{
  "featured": *[_type == "article" && featured == true] | order(publishedAt desc)[0] {
    ${articleFields}
  },
  "latest": *[_type == "article" && featured != true] | order(publishedAt desc)[0...5] {
    ${articleFields}
  }
}`

// Articles index: all articles paginated
export const allArticlesQuery = groq`
  *[_type == "article"] | order(publishedAt desc) {
    ${articleFields}
  }
`

// Articles by category
export const articlesByCategoryQuery = groq`
  *[_type == "article" && category->slug.current == $slug] | order(publishedAt desc) {
    ${articleFields}
  }
`

// Single article by slug
export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    ${articleFields},
    body,
    seo
  }
`

// All categories
export const categoriesQuery = groq`
  *[_type == "category"] | order(title asc) { _id, title, slug }
`

// Tools — ordered by display order
export const toolsQuery = groq`
  *[_type == "tool"] | order(order asc) {
    _id, name, slug, tagline, description, icon, url, status
  }
`

// Single article — full fields including author, takeaways, FAQ, hero
export const articleFullBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    kicker,
    slug,
    excerpt,
    publishedAt,
    lastModified,
    readTime,
    featured,
    tags,
    keyTakeaways,
    faq[] { _key, question, answer },
    "category": category->{ title, slug },
    "author": author->{ _id, name, slug, role, bio, twitterUrl, linkedinUrl,
      "avatar": avatar.asset->{ url }
    },
    "heroImage": { "url": heroImage.asset->url, "alt": heroImage.alt },
    body[] {
      ...,
      _type == "image" => {
        _type,
        _key,
        alt,
        "asset": { "_ref": asset._ref, "url": asset->url }
      }
    },
    seo
  }
`

// Author by slug — with their articles
export const authorBySlugQuery = groq`
  *[_type == "author" && slug.current == $slug][0] {
    _id, name, slug, role, bio, linkedinUrl,
    "avatar": avatar.asset->{ url },
    "articles": *[_type == "article" && references(^._id)] | order(publishedAt desc) {
      ${articleFields}
    }
  }
`

// Skill sources — published only, featured first
export const allSkillSourcesQuery = groq`
  *[_type == "skillSource" && status == "published"] | order(featured desc, name asc) {
    _id, name, slug, description, url, installCmd,
    domains, platforms, skillCount, skillCountPrev,
    sourceType, featured, status
  }
`

// Single skill source by slug
export const skillSourceBySlugQuery = groq`
  *[_type == "skillSource" && slug.current == $slug && status == "published"][0] {
    _id, name, slug, description, url, installCmd,
    domains, platforms, skillCount, skillCountPrev, skillCountUpdatedAt,
    sourceType, featured, status, seo
  }
`
