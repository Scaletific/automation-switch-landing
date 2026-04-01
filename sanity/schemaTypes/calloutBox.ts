import { defineField, defineType } from 'sanity'

export const calloutBox = defineType({
  name: 'calloutBox',
  title: 'Callout Box',
  type: 'object',
  fields: [
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Tip', value: 'tip' },
          { title: 'Warning', value: 'warning' },
          { title: 'Danger', value: 'danger' },
        ],
        layout: 'radio',
      },
      initialValue: 'info',
      validation: r => r.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional bold heading inside the callout.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 3,
      validation: r => r.required(),
    }),
  ],
  preview: {
    select: { variant: 'variant', title: 'title', body: 'body' },
    prepare({ variant, title, body }: { variant?: string; title?: string; body?: string }) {
      const icons: Record<string, string> = { info: 'ℹ️', tip: '💡', warning: '⚠️', danger: '🚨' }
      return {
        title: `${icons[variant ?? ''] ?? '📌'} ${title || body?.slice(0, 40) || 'Callout'}`,
        subtitle: variant?.toUpperCase(),
      }
    },
  },
})
