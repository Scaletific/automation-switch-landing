import { defineField, defineType } from 'sanity'

export const howToSteps = defineType({
  name: 'howToSteps',
  title: 'How-To Steps',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional heading. E.g. "How to automate your lead pipeline in 4 steps".',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'howToStep',
          fields: [
            defineField({ name: 'title', title: 'Step Title', type: 'string', validation: r => r.required() }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3, validation: r => r.required() }),
          ],
          preview: { select: { title: 'title' } },
        },
      ],
      validation: r => r.required().min(2),
    }),
  ],
  preview: {
    select: { title: 'title', steps: 'steps' },
    prepare({ title, steps }: { title?: string; steps?: unknown[] }) {
      return {
        title: title || 'How-To Steps',
        subtitle: `${(steps ?? []).length} steps`,
      }
    },
  },
})
