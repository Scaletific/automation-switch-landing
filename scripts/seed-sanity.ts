/**
 * Sanity seed script — creates required Author + Category documents.
 *
 * Usage (from the automationswitch project root):
 *   node --env-file=.env.local --import tsx/esm scripts/seed-sanity.ts
 *
 * Or simply:
 *   npx tsx --env-file=.env.local scripts/seed-sanity.ts
 */

import { createClient } from '@sanity/client'

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'l4o4vshf'
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production'
const TOKEN      = process.env.SANITY_WRITE_TOKEN

if (!TOKEN || TOKEN === 'REPLACE_WITH_EDITOR_TOKEN') {
  console.error('\n❌  SANITY_WRITE_TOKEN is not set in .env.local')
  console.error('    Get it from: https://sanity.io/manage → project l4o4vshf → API → Tokens → Editor role\n')
  process.exit(1)
}

const client = createClient({
  projectId:  PROJECT_ID,
  dataset:    DATASET,
  apiVersion: '2024-01-01',
  token:      TOKEN,
  useCdn:     false,
})

// ── Documents to seed ─────────────────────────────────────────────────────────

const categories = [
  { _id: 'category-deep-dive',    title: 'Deep Dive',    slug: 'deep-dive'    },
  { _id: 'category-tool-guide',   title: 'Tool Guide',   slug: 'tool-guide'   },
  { _id: 'category-fundamentals', title: 'Fundamentals', slug: 'fundamentals' },
  { _id: 'category-case-study',   title: 'Case Study',   slug: 'case-study'   },
  { _id: 'category-standalone',   title: 'Standalone',   slug: 'standalone'   },
]

const author = {
  _id:   'author-michael-nouriel',
  _type: 'author',
  name:  'Michael Nouriel',
  slug:  { _type: 'slug', current: 'michael-nouriel' },
  role:  'Founder, Automation Switch',
  bio:   'Building automation systems and writing about the tools, patterns, and workflows that make them work.',
}

// ── Seed ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`\n🌱  Seeding Sanity — project: ${PROJECT_ID} / dataset: ${DATASET}\n`)

  for (const cat of categories) {
    await client.createOrReplace({
      _id:   cat._id,
      _type: 'category',
      title: cat.title,
      slug:  { _type: 'slug', current: cat.slug },
    })
    console.log(`  ✓ Category: ${cat.title}`)
  }

  await client.createOrReplace(author)
  console.log(`  ✓ Author:   ${author.name} (slug: ${author.slug.current})`)

  console.log('\n✅  Done.\n')
  console.log('Next steps:')
  console.log('  1. Open Sanity Studio (/studio) and add an avatar image to the Michael Nouriel author record.')
  console.log('  2. The sync script can now find both author and category references.\n')
}

seed().catch(err => {
  console.error('\n❌  Seed failed:', err.message)
  process.exit(1)
})
