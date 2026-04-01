import { defineField, defineType } from 'sanity'

export const statHighlight = defineType({
  name: 'statHighlight',
  title: 'Stat Highlight',
  type: 'object',
  fields: [
    defineField({
      name: 'figure',
      title: 'Figure',
      type: 'string',
      description: 'The big number or stat. E.g. "83%" or "4.2x" or "$12,000".',
      validation: r => r.required(),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'What the figure means. E.g. "of repetitive tasks can be automated".',
      validation: r => r.required(),
    }),
    defineField({
      name: 'context',
      title: 'Context',
      type: 'text',
      rows: 2,
      description: 'Optional 1-2 sentence supporting statement.',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'Attribution. E.g. "McKinsey Global Institute, 2024".',
    }),
  ],
  preview: {
    select: { figure: 'figure', label: 'label' },
    prepare({ figure, label }: { figure?: string; label?: string }) {
      return { title: figure, subtitle: label }
    },
  },
})
