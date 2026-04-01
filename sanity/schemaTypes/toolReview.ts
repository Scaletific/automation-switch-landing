import { defineField, defineType } from 'sanity'

export const toolReview = defineType({
  name: 'toolReview',
  title: 'Tool Review',
  type: 'document',
  groups: [
    { name: 'core', title: 'Core', default: true },
    { name: 'review', title: 'Review' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'name', title: 'Tool Name', type: 'string', group: 'core', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', group: 'core', options: { source: 'name' }, validation: r => r.required() }),
    defineField({
      name: 'tagline', title: 'Tagline', type: 'string', group: 'core',
      description: 'One-line description. E.g. "The no-code automation platform for technical teams".',
      validation: r => r.required(),
    }),
    defineField({
      name: 'featuredImage', title: 'Featured Image', type: 'image', group: 'core',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: r => r.required() })],
    }),
    defineField({ name: 'externalUrl', title: 'Official URL', type: 'url', group: 'core' }),
    defineField({
      name: 'affiliateUrl', title: 'Affiliate URL', type: 'url', group: 'core',
      description: 'Use instead of externalUrl if an affiliate link exists.',
    }),
    defineField({
      name: 'category', title: 'Category', type: 'string', group: 'core',
      options: {
        list: [
          { title: 'Workflow Automation', value: 'workflow-automation' },
          { title: 'AI Tools', value: 'ai-tools' },
          { title: 'Email Automation', value: 'email-automation' },
          { title: 'Data Pipeline', value: 'data-pipeline' },
          { title: 'CRM & Sales', value: 'crm-sales' },
          { title: 'Developer Tools', value: 'developer-tools' },
        ],
        layout: 'dropdown',
      },
      validation: r => r.required(),
    }),
    defineField({
      name: 'overallRating', title: 'Overall Rating', type: 'number', group: 'review',
      description: '1.0 – 5.0. Used in Review JSON-LD.',
      validation: r => r.required().min(1).max(5),
    }),
    defineField({
      name: 'verdict', title: 'Verdict', type: 'text', group: 'review', rows: 3,
      description: '2-3 sentence bottom-line verdict. Used in Review JSON-LD description.',
      validation: r => r.required(),
    }),
    defineField({
      name: 'pros', title: 'Pros', type: 'array', group: 'review',
      of: [{ type: 'string' }],
      validation: r => r.required().min(2).max(8),
    }),
    defineField({
      name: 'cons', title: 'Cons', type: 'array', group: 'review',
      of: [{ type: 'string' }],
      validation: r => r.required().min(1).max(6),
    }),
    defineField({
      name: 'pricingTiers', title: 'Pricing Tiers', type: 'array', group: 'review',
      of: [{
        type: 'object',
        name: 'pricingTier',
        fields: [
          defineField({ name: 'name', title: 'Tier Name', type: 'string', validation: r => r.required() }),
          defineField({ name: 'price', title: 'Price', type: 'string', description: 'E.g. "Free", "$20/mo"', validation: r => r.required() }),
          defineField({ name: 'description', title: 'What is included', type: 'string' }),
        ],
        preview: { select: { title: 'name', subtitle: 'price' } },
      }],
    }),
    defineField({
      name: 'bestFor', title: 'Best For', type: 'string', group: 'review',
      description: 'E.g. "Small teams that need simple automations without engineering support".',
    }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime', group: 'review', validation: r => r.required() }),
    defineField({
      name: 'lastTestedAt', title: 'Last Tested At', type: 'datetime', group: 'review',
      description: 'When the tool was last evaluated.',
    }),
    defineField({
      name: 'seo', title: 'SEO', type: 'object', group: 'seo',
      fields: [
        defineField({ name: 'metaTitle', title: 'Meta Title', type: 'string', validation: r => r.max(60) }),
        defineField({ name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2, validation: r => r.max(160) }),
      ],
    }),
  ],
  preview: {
    select: { title: 'name', rating: 'overallRating', category: 'category', media: 'featuredImage' },
    prepare({ title, rating, category, media }: { title?: string; rating?: number; category?: string; media?: any }) {
      const stars = rating ? '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating)) : ''
      return { title, subtitle: `${stars} · ${category ?? ''}`, media }
    },
  },
})
