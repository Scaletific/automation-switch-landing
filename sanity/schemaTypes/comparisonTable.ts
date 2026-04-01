import { defineField, defineType } from 'sanity'

export const comparisonTable = defineType({
  name: 'comparisonTable',
  title: 'Comparison Table',
  type: 'object',
  fields: [
    defineField({
      name: 'headline',
      title: 'Table Headline',
      type: 'string',
      description: 'Optional headline shown above the table. E.g. "Feature-by-Feature Comparison"',
    }),
    defineField({
      name: 'tools',
      title: 'Tools / Columns',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'comparisonTool',
          fields: [
            defineField({ name: 'name', title: 'Tool Name', type: 'string', validation: r => r.required() }),
            defineField({
              name: 'logo',
              title: 'Tool Logo',
              type: 'image',
              description: 'Optional 24×24 logo. Use official brand assets.',
              options: { hotspot: false },
            }),
          ],
          preview: { select: { title: 'name', media: 'logo' } },
        },
      ],
      validation: r => r.required().min(2).max(5),
      description: 'The tools being compared. 2–5 columns.',
    }),
    defineField({
      name: 'rows',
      title: 'Comparison Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'comparisonRow',
          fields: [
            defineField({
              name: 'criteria',
              title: 'Criteria',
              type: 'string',
              validation: r => r.required(),
              description: 'The evaluation criteria. E.g. "Free Tier", "API Access", "Self-Hosted Option"',
            }),
            defineField({
              name: 'values',
              title: 'Values',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'One value per tool column, in order. Use "check" for ✓, "x" for ✗, "partial" for ~, or free text.',
              validation: r => r.required(),
            }),
          ],
          preview: {
            select: { title: 'criteria' },
          },
        },
      ],
      validation: r => r.required().min(1),
    }),
    defineField({
      name: 'bestFor',
      title: 'Best For (footer row)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'One "Best For" descriptor per tool column. E.g. "Solo founders", "Enterprise teams". Leave empty to hide.',
    }),
    defineField({
      name: 'winnerIndex',
      title: 'Winner Column (0-based index)',
      type: 'number',
      description: 'Highlight a column as the recommended pick. 0 = first tool, 1 = second, etc. Leave empty for no highlight.',
    }),
  ],
  preview: {
    select: { headline: 'headline' },
    prepare({ headline }) {
      return {
        title: headline || 'Comparison Table',
        subtitle: 'Interactive comparison grid',
      }
    },
  },
})
