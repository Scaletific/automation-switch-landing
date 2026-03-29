import { defineField, defineType } from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO & Meta' },
    { name: 'richSnippets', title: 'Rich Snippets' },
  ],
  fields: [
    // ── CONTENT ──────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: r => r.required(),
    }),
    defineField({
      name: 'kicker',
      title: 'Kicker',
      type: 'string',
      group: 'content',
      description: 'Short editorial phrase shown above the headline in article cards and on the article page. Sets the angle before the headline. E.g. "The missing layer" or "Why teams fail". No punctuation at end. Max 80 chars.',
      validation: r => r.max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title' },
      validation: r => r.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'content',
      to: [{ type: 'author' }],
      validation: r => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      group: 'content',
      to: [{ type: 'category' }],
      validation: r => r.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe what is in the image — not the article title. Required for SEO and accessibility.',
          validation: r => r.required(),
        }),
      ],
      validation: r => r.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'Used as the default meta description. Max 200 characters.',
      validation: r => r.required().max(200),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: r => r.required() }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'content',
      validation: r => r.required(),
    }),
    defineField({
      name: 'lastModified',
      title: 'Last Modified',
      type: 'datetime',
      group: 'content',
      description: 'Update this whenever making significant content changes. Drives the "Updated" badge and dateModified in Article schema.',
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
      group: 'content',
      description: 'Estimated at ~238 words per minute.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      group: 'content',
      initialValue: false,
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: '3–7 keyword-rich tags. Lowercase, specific phrases. Maps to article:tag Open Graph properties.',
    }),

    // ── SEO & META ───────────────────────────────────────────
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: '50–60 characters. Overrides the article title in <title> and og:title.',
          validation: r => r.max(60),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 2,
          description: '150–160 characters. Overrides excerpt for meta description and og:description.',
          validation: r => r.max(160),
        }),
        defineField({
          name: 'canonicalUrl',
          title: 'Canonical URL Override',
          type: 'url',
          description: 'Only set if the canonical URL differs from the default /articles/[slug].',
        }),
        defineField({
          name: 'noIndex',
          title: 'No Index',
          type: 'boolean',
          initialValue: false,
          description: 'Set true to exclude this article from search engine indexing.',
        }),
      ],
    }),

    // ── RICH SNIPPETS ────────────────────────────────────────
    defineField({
      name: 'keyTakeaways',
      title: 'Key Takeaways',
      type: 'array',
      group: 'richSnippets',
      of: [{ type: 'string' }],
      description: '3–5 complete sentences. Renders as the TL;DR box at the top of the article. Primary target for Google featured snippets.',
      validation: r => r.max(5),
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      group: 'richSnippets',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          title: 'FAQ Item',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              description: 'Phrase as a real user search query (How do I…, Why does…, What is…)',
              validation: r => r.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 3,
              description: '2–4 sentences. This text is used verbatim in the FAQPage JSON-LD schema.',
              validation: r => r.required(),
            }),
          ],
          preview: {
            select: { title: 'question' },
          },
        },
      ],
      description: 'Generates FAQPage JSON-LD — expands your Google listing with accordion Q&As. 2–4 items recommended.',
    }),
  ],
  orderings: [
    { title: 'Published Date, New', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
    { title: 'Published Date, Old', name: 'publishedAtAsc', by: [{ field: 'publishedAt', direction: 'asc' }] },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      category: 'category.title',
      media: 'heroImage',
    },
    prepare({ title, author, category, media }) {
      return {
        title,
        subtitle: `${category ?? 'Uncategorised'} · ${author ?? 'No author'}`,
        media,
      }
    },
  },
})
