import { defineField, defineType } from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: r => r.required().max(400),
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      validation: r => r.required(),
    }),
    defineField({
      name: 'authorRole',
      title: 'Author Role',
      type: 'string',
      description: 'E.g. "Head of Operations"',
    }),
    defineField({
      name: 'authorCompany',
      title: 'Author Company',
      type: 'string',
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Pin to homepage or featured sections.',
    }),
    defineField({
      name: 'context',
      title: 'Context',
      type: 'string',
      options: {
        list: [
          { title: 'Newsletter Subscriber', value: 'newsletter' },
          { title: 'Audit Tool User', value: 'audit-tool' },
          { title: 'Article Reader', value: 'article' },
          { title: 'Consulting Client', value: 'consulting' },
        ],
        layout: 'dropdown',
      },
    }),
  ],
  preview: {
    select: { title: 'authorName', subtitle: 'authorCompany', media: 'avatar' },
  },
})
