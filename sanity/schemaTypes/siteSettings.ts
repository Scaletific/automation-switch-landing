import { defineType, defineField } from 'sanity'

/**
 * siteSettings — singleton document for global site config.
 * Only one record should ever exist (enforced by the fixed document ID "siteSettings").
 *
 * Use this to toggle features without code deploys.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'skillsHubLive',
      title: 'Skills Hub Live',
      type: 'boolean',
      description: 'Show the Skills Hub CTA in the SKILL.md article and add /skills to the nav. Flip to true once /skills is deployed.',
      initialValue: false,
    }),
    defineField({
      name: 'maintenanceMode',
      title: 'Maintenance Mode',
      type: 'boolean',
      description: 'Show a site-wide maintenance banner.',
      initialValue: false,
    }),
    defineField({
      name: 'announcementBar',
      title: 'Announcement Bar',
      type: 'object',
      fields: [
        defineField({ name: 'enabled', type: 'boolean', initialValue: false }),
        defineField({ name: 'message', type: 'string', description: 'Short announcement text' }),
        defineField({ name: 'linkUrl', type: 'url' }),
        defineField({ name: 'linkLabel', type: 'string' }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
