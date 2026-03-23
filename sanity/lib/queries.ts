import { groq } from 'next-sanity'

// Article fields shared across queries
const articleFields = groq`
  _id,
  title,
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
