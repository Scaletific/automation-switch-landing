import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * skillSource — a vetted source of SKILL.md files / agent skill collections.
 *
 * One record = one source (a repo, site, CLI, or spec) — NOT an individual skill file.
 * Populated initially via manual seed, then maintained by the Firecrawl sync cron.
 *
 * Firecrawl-managed fields (do not edit manually):
 *   skillCount, skillCountPrev, skillCountUpdatedAt, lastCrawledAt
 */
export const skillSource = defineType({
  name: 'skillSource',
  title: 'Skill Source',
  type: 'document',

  groups: [
    { name: 'core',    title: 'Core',           default: true },
    { name: 'classify', title: 'Classification' },
    { name: 'crawl',   title: 'Crawl Data'      },
    { name: 'seo',     title: 'SEO'             },
  ],

  fields: [

    // ── Core ──────────────────────────────────────────────────────────────────

    defineField({
      name: 'name',
      title: 'Source Name',
      type: 'string',
      group: 'core',
      validation: r => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'core',
      options: { source: 'name', maxLength: 96 },
      validation: r => r.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      group: 'core',
      description: 'One or two sentences. What this source contains and who it is for.',
      validation: r => r.required().max(300),
    }),

    defineField({
      name: 'url',
      title: 'Source URL',
      type: 'url',
      group: 'core',
      description: 'The canonical URL of the repo, site, or spec page.',
      validation: r => r.required(),
    }),

    defineField({
      name: 'installCmd',
      title: 'Install Command',
      type: 'string',
      group: 'core',
      description: 'Optional. e.g. npx skills add vercel — only if the source ships a CLI.',
    }),

    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      group: 'core',
      description: 'Pinned to the top of the directory grid.',
      initialValue: false,
    }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'core',
      options: {
        list: [
          { title: 'Published',      value: 'published'      },
          { title: 'Pending Review', value: 'pending-review' },
          { title: 'Rejected',       value: 'rejected'       },
        ],
        layout: 'radio',
      },
      initialValue: 'pending-review',
      validation: r => r.required(),
    }),

    // ── Classification ────────────────────────────────────────────────────────

    defineField({
      name: 'sourceType',
      title: 'Source Type',
      type: 'string',
      group: 'classify',
      options: {
        list: [
          { title: 'Official (platform-maintained)', value: 'official'   },
          { title: 'Community',                      value: 'community'  },
          { title: 'Tooling / CLI',                  value: 'tooling'    },
          { title: 'Specification / Standard',       value: 'spec'       },
        ],
        layout: 'radio',
      },
      validation: r => r.required(),
    }),

    defineField({
      name: 'platforms',
      title: 'Platform Compatibility',
      type: 'array',
      group: 'classify',
      description: 'Which AI coding agents / platforms these skills target.',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'Claude Code',  value: 'claude-code'  },
          { title: 'Cursor',       value: 'cursor'       },
          { title: 'Copilot',      value: 'copilot'      },
          { title: 'Gemini CLI',   value: 'gemini-cli'   },
          { title: 'Aider',        value: 'aider'        },
          { title: 'Windsurf',     value: 'windsurf'     },
          { title: 'Any / Generic', value: 'generic'     },
        ],
        layout: 'grid',
      },
    }),

    defineField({
      name: 'domains',
      title: 'Domains',
      type: 'array',
      group: 'classify',
      description: 'What areas of work these skills cover.',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'Engineering',    value: 'engineering'    },
          { title: 'DevOps',         value: 'devops'         },
          { title: 'Product',        value: 'product'        },
          { title: 'Marketing',      value: 'marketing'      },
          { title: 'Data / Analytics', value: 'data'         },
          { title: 'Design',         value: 'design'         },
          { title: 'Finance',        value: 'finance'        },
          { title: 'Legal',          value: 'legal'          },
          { title: 'General',        value: 'general'        },
        ],
        layout: 'grid',
      },
    }),

    // ── Crawl Data (Firecrawl-managed) ────────────────────────────────────────

    defineField({
      name: 'skillCount',
      title: 'Skill Count',
      type: 'number',
      group: 'crawl',
      description: 'Current number of SKILL.md files detected. Updated by Firecrawl cron.',
      readOnly: false, // Firecrawl writes this; manual override allowed
    }),

    defineField({
      name: 'skillCountPrev',
      title: 'Previous Skill Count',
      type: 'number',
      group: 'crawl',
      description: 'Count from the prior crawl run. Used to calculate Δ for the UI badge.',
      readOnly: false,
    }),

    defineField({
      name: 'skillCountUpdatedAt',
      title: 'Count Last Updated',
      type: 'datetime',
      group: 'crawl',
      description: 'When skillCount was last changed by a crawl.',
    }),

    defineField({
      name: 'lastCrawledAt',
      title: 'Last Crawled At',
      type: 'datetime',
      group: 'crawl',
      description: 'Timestamp of the most recent Firecrawl run against this source.',
    }),

    defineField({
      name: 'crawlErrors',
      title: 'Crawl Errors',
      type: 'number',
      group: 'crawl',
      description: 'Consecutive failed crawl attempts. At 3+, source is flagged for review.',
      initialValue: 0,
    }),

    // ── SEO ───────────────────────────────────────────────────────────────────

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
          description: 'Defaults to source name if blank. Max 60 chars.',
          validation: r => r.max(60),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 2,
          description: 'Max 155 chars.',
          validation: r => r.max(155),
        }),
        defineField({
          name: 'ogImage',
          title: 'OG Image',
          type: 'image',
          options: { hotspot: true },
        }),
      ],
    }),

  ],

  // ── Preview ────────────────────────────────────────────────────────────────

  preview: {
    select: {
      title:    'name',
      subtitle: 'sourceType',
      status:   'status',
      count:    'skillCount',
    },
    prepare({ title, subtitle, status, count }) {
      const statusIcon = status === 'published' ? '✅' : status === 'rejected' ? '🚫' : '⏳'
      const countLabel = count != null ? ` · ${count} skills` : ''
      return {
        title:    `${statusIcon} ${title}`,
        subtitle: `${subtitle ?? ''}${countLabel}`,
      }
    },
  },
})
