import { defineField, defineType } from 'sanity'

export const glossaryTerm = defineType({
  name: 'glossaryTerm',
  title: 'Glossary Term',
  type: 'document',
  fields: [
    defineField({
      name: 'term',
      title: 'Term',
      type: 'string',
      validation: r => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'term' },
      validation: r => r.required(),
    }),
    defineField({
      name: 'definition',
      title: 'Definition',
      type: 'text',
      rows: 4,
      description: '2-4 sentences. Plain language. Used verbatim in DefinedTerm JSON-LD.',
      validation: r => r.required().max(600),
    }),
    defineField({
      name: 'pillar',
      title: 'Pillar',
      type: 'string',
      options: {
        list: [
          { title: 'Workflow Automation', value: 'workflow-automation' },
          { title: 'AI Workflows', value: 'ai-workflows' },
          { title: 'Tool Comparisons', value: 'tool-comparisons' },
          { title: 'Automation Audits', value: 'automation-audits' },
          { title: 'Hyperautomation', value: 'hyperautomation' },
          { title: 'Production Readiness', value: 'production-readiness' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'relatedTerms',
      title: 'Related Terms',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'glossaryTerm' }] }],
      validation: r => r.max(5),
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
      validation: r => r.max(3),
    }),
  ],
  orderings: [
    { title: 'Term A-Z', name: 'termAsc', by: [{ field: 'term', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'term', subtitle: 'pillar' },
  },
})
