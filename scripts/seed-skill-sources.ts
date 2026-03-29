/**
 * seed-skill-sources.ts
 * Automation Switch — initial skillSource seed
 *
 * Creates a curated set of vetted skill sources in Sanity.
 * Safe to re-run — uses createOrReplace (idempotent).
 *
 * Run:
 *   npx tsx --env-file=.env.local scripts/seed-skill-sources.ts
 */

import { createClient } from '@sanity/client'

const sanity = createClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'l4o4vshf',
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production',
  token:      process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn:     false,
})

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────────────────────

const sources = [

  // ── Official ───────────────────────────────────────────────────────────────

  {
    _id:         'skillsource-anthropic-claude-code',
    _type:       'skillSource',
    name:        'Claude Code (Anthropic)',
    slug:        { _type: 'slug', current: 'anthropic-claude-code' },
    description: 'The official Claude Code repository from Anthropic. The reference implementation for the SKILL.md format — where the standard itself lives.',
    url:         'https://github.com/anthropics/claude-code',
    sourceType:  'official',
    platforms:   ['claude-code'],
    domains:     ['engineering', 'devops'],
    status:      'published',
    featured:    true,
    crawlErrors: 0,
  },

  // ── Community GitHub collections ───────────────────────────────────────────

  {
    _id:         'skillsource-hoodini-ai-agents-skills',
    _type:       'skillSource',
    name:        'AI Agent Skills (hoodini)',
    slug:        { _type: 'slug', current: 'hoodini-ai-agents-skills' },
    description: 'Curated collection of SKILL.md files for Claude Code, Cursor, Copilot, and Windsurf. One of the most actively maintained multi-agent skill repositories.',
    url:         'https://github.com/hoodini/ai-agents-skills',
    sourceType:  'community',
    platforms:   ['claude-code', 'cursor', 'copilot', 'windsurf'],
    domains:     ['engineering', 'devops', 'general'],
    status:      'published',
    featured:    true,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-composio-awesome-claude-skills',
    _type:       'skillSource',
    name:        'Awesome Claude Skills (ComposioHQ)',
    slug:        { _type: 'slug', current: 'composio-awesome-claude-skills' },
    description: 'A curated awesome-list of Claude Code skills maintained by the Composio team. Covers engineering workflows, DevOps, and integration patterns.',
    url:         'https://github.com/ComposioHQ/awesome-claude-skills',
    sourceType:  'community',
    platforms:   ['claude-code'],
    domains:     ['engineering', 'devops'],
    status:      'published',
    featured:    false,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-voltagent-awesome-agent-skills',
    _type:       'skillSource',
    name:        'Awesome Agent Skills (VoltAgent)',
    slug:        { _type: 'slug', current: 'voltagent-awesome-agent-skills' },
    description: 'Large community-maintained collection of agent skills compatible with Claude Code, Cursor, Copilot, Gemini CLI, and Aider.',
    url:         'https://github.com/VoltAgent/awesome-agent-skills',
    sourceType:  'community',
    platforms:   ['claude-code', 'cursor', 'copilot', 'gemini-cli', 'aider'],
    domains:     ['engineering', 'devops', 'general'],
    status:      'published',
    featured:    false,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-cavinhuang-claude-skills-hub',
    _type:       'skillSource',
    name:        'Claude Skills Hub (CavinHuang)',
    slug:        { _type: 'slug', current: 'cavinhuang-claude-skills-hub' },
    description: 'Free Claude Code skill collection with 150+ skills covering common development workflows. Well-organised by category.',
    url:         'https://github.com/CavinHuang/claude-skills-hub',
    sourceType:  'community',
    platforms:   ['claude-code'],
    domains:     ['engineering', 'general'],
    status:      'published',
    featured:    false,
    crawlErrors: 0,
  },

  // ── Aggregator sites ───────────────────────────────────────────────────────

  {
    _id:         'skillsource-agentskills-so',
    _type:       'skillSource',
    name:        'AgentSkills.so',
    slug:        { _type: 'slug', current: 'agentskills-so' },
    description: 'Community aggregator and discovery platform for AI agent skills. Indexes skills from multiple sources with search and category filtering.',
    url:         'https://agentskills.so',
    sourceType:  'community',
    platforms:   ['claude-code', 'cursor', 'copilot', 'gemini-cli', 'aider', 'windsurf'],
    domains:     ['engineering', 'devops', 'general'],
    status:      'published',
    featured:    true,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-skillhub-club',
    _type:       'skillSource',
    name:        'SkillHub.Club',
    slug:        { _type: 'slug', current: 'skillhub-club' },
    description: 'AI-evaluated skills marketplace. Each skill is scored on Practicality, Clarity, Automation, Quality, and Impact — with S-tier and A-tier rankings.',
    url:         'https://skillhub.club',
    sourceType:  'community',
    platforms:   ['claude-code', 'cursor', 'copilot', 'gemini-cli'],
    domains:     ['engineering', 'general'],
    status:      'published',
    featured:    false,
    crawlErrors: 0,
  },

  // ── Specification / Standard ───────────────────────────────────────────────

  {
    _id:         'skillsource-skills-sh',
    _type:       'skillSource',
    name:        'skills.sh',
    slug:        { _type: 'slug', current: 'skills-sh' },
    description: 'Open SKILL.md standard reference and resources. The canonical home for the SKILL.md specification, format documentation, and tooling guidance.',
    url:         'https://skills.sh',
    sourceType:  'spec',
    platforms:   ['claude-code', 'cursor', 'copilot', 'gemini-cli', 'aider', 'windsurf'],
    domains:     ['engineering', 'general'],
    status:      'published',
    featured:    false,
    crawlErrors: 0,
  },

]

// ─────────────────────────────────────────────────────────────────────────────
// RUN
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    throw new Error('SANITY_WRITE_TOKEN is not set')
  }

  console.log(`[seed] Seeding ${sources.length} skill source(s)...`)

  for (const source of sources) {
    await sanity.createOrReplace(source)
    console.log(`[seed] ✓ ${source.name}`)
  }

  console.log(`[seed] Done — ${sources.length} sources seeded.`)
  console.log(`[seed] Next: run sync-skills.ts to populate skillCount for each source.`)
}

seed().catch(err => {
  console.error('[seed] Fatal:', err)
  process.exit(1)
})
