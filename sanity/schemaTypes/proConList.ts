import { defineField, defineType } from 'sanity'

export const proConList = defineType({
  name: 'proConList',
  title: 'Pros & Cons',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional heading above the pros/cons grid.',
    }),
    defineField({
      name: 'pros',
      title: 'Pros',
      type: 'array',
      of: [{ type: 'string' }],
      validation: r => r.required().min(1),
    }),
    defineField({
      name: 'cons',
      title: 'Cons',
      type: 'array',
      of: [{ type: 'string' }],
      validation: r => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'title', pros: 'pros', cons: 'cons' },
    prepare({ title, pros, cons }: { title?: string; pros?: string[]; cons?: string[] }) {
      return {
        title: title || 'Pros & Cons',
        subtitle: `${(pros ?? []).length} pros · ${(cons ?? []).length} cons`,
      }
    },
  },
})
