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

  // ── Official vendor skill libraries ───────────────────────────────────────

  {
    _id:         'skillsource-vercel-labs-agent-skills',
    _type:       'skillSource',
    name:        'Agent Skills (Vercel Labs)',
    slug:        { _type: 'slug', current: 'vercel-labs-agent-skills' },
    description: 'Official Vercel agent skills covering React best practices, web design guidelines, React Native, composition patterns, and Vercel deployment workflows.',
    url:         'https://github.com/vercel-labs/agent-skills',
    sourceType:  'official',
    platforms:   ['claude-code', 'cursor', 'copilot'],
    domains:     ['engineering', 'devops'],
    status:      'published',
    featured:    true,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-supabase-agent-skills',
    _type:       'skillSource',
    name:        'Agent Skills (Supabase)',
    slug:        { _type: 'slug', current: 'supabase-agent-skills' },
    description: 'Official Supabase agent skills for Postgres best practices, database design, and Supabase-specific workflows. Maintained by the Supabase engineering team.',
    url:         'https://github.com/supabase/agent-skills',
    sourceType:  'official',
    platforms:   ['claude-code', 'cursor', 'copilot'],
    domains:     ['engineering', 'data'],
    status:      'published',
    featured:    true,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-hashicorp-agent-skills',
    _type:       'skillSource',
    name:        'Agent Skills (HashiCorp)',
    slug:        { _type: 'slug', current: 'hashicorp-agent-skills' },
    description: 'Official HashiCorp agent skills for Terraform and Packer. Covers infrastructure-as-code best practices directly from the HashiCorp team.',
    url:         'https://github.com/hashicorp/agent-skills',
    sourceType:  'official',
    platforms:   ['claude-code', 'cursor', 'copilot'],
    domains:     ['devops', 'engineering'],
    status:      'published',
    featured:    true,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-neondatabase-agent-skills',
    _type:       'skillSource',
    name:        'Agent Skills (Neon)',
    slug:        { _type: 'slug', current: 'neondatabase-agent-skills' },
    description: 'Official Neon agent skills for serverless Postgres. Includes skills for neon-postgres, claimable-postgres, and egress optimisation.',
    url:         'https://github.com/neondatabase/agent-skills',
    sourceType:  'official',
    platforms:   ['claude-code', 'cursor'],
    domains:     ['engineering', 'data'],
    status:      'published',
    featured:    false,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-google-gemini-skills',
    _type:       'skillSource',
    name:        'Gemini Skills (Google)',
    slug:        { _type: 'slug', current: 'google-gemini-skills' },
    description: 'Official Google Gemini agent skills covering the Gemini API, Vertex AI, Gemini Live API, and Gemini interactions SDK.',
    url:         'https://github.com/google-gemini/gemini-skills',
    sourceType:  'official',
    platforms:   ['gemini-cli'],
    domains:     ['engineering', 'general'],
    status:      'published',
    featured:    false,
    crawlErrors: 0,
  },

  // ── Large community collections ────────────────────────────────────────────

  {
    _id:         'skillsource-alirezarezvani-claude-skills',
    _type:       'skillSource',
    name:        'Claude Skills (alirezarezvani)',
    slug:        { _type: 'slug', current: 'alirezarezvani-claude-skills' },
    description: '205 production-ready skills across 9 domains including Engineering, Playwright, Marketing, and Product. Compatible with 11 AI platforms. Includes Python CLI tooling.',
    url:         'https://github.com/alirezarezvani/claude-skills',
    sourceType:  'community',
    platforms:   ['claude-code', 'cursor', 'copilot', 'gemini-cli', 'aider', 'windsurf'],
    domains:     ['engineering', 'devops', 'general'],
    status:      'published',
    featured:    true,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-behisecc-awesome-claude-skills',
    _type:       'skillSource',
    name:        'Awesome Claude Skills (BehiSecc)',
    slug:        { _type: 'slug', current: 'behisecc-awesome-claude-skills' },
    description: '300+ skills across 13 categories including development, data, scientific, writing, security, and utilities. Compatible with Claude Code, Cursor, Copilot, Windsurf, Zed, and 20+ additional tools.',
    url:         'https://github.com/BehiSecc/awesome-claude-skills',
    sourceType:  'community',
    platforms:   ['claude-code', 'cursor', 'copilot', 'windsurf'],
    domains:     ['engineering', 'data', 'general'],
    status:      'published',
    featured:    true,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-travisvn-awesome-claude-skills',
    _type:       'skillSource',
    name:        'Awesome Claude Skills (travisvn)',
    slug:        { _type: 'slug', current: 'travisvn-awesome-claude-skills' },
    description: 'Curated index of 105+ Claude Skills resources spanning official and community sources. Covers Claude.ai, Claude Code, Claude API, and Claude Desktop.',
    url:         'https://github.com/travisvn/awesome-claude-skills',
    sourceType:  'community',
    platforms:   ['claude-code'],
    domains:     ['engineering', 'general'],
    status:      'published',
    featured:    false,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-gentleman-programming-skills',
    _type:       'skillSource',
    name:        'Gentleman Skills (Gentleman-Programming)',
    slug:        { _type: 'slug', current: 'gentleman-programming-skills' },
    description: 'Community-driven skill collection with democratic 7-day voting for submissions. Covers frontend (Angular, React, Next.js), backend, AI tools, and testing. Compatible with 8+ agent platforms.',
    url:         'https://github.com/Gentleman-Programming/Gentleman-Skills',
    sourceType:  'community',
    platforms:   ['claude-code', 'cursor', 'copilot', 'gemini-cli', 'windsurf'],
    domains:     ['engineering', 'general'],
    status:      'published',
    featured:    false,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-jeffallan-claude-skills',
    _type:       'skillSource',
    name:        'Claude Skills (Jeffallan)',
    slug:        { _type: 'slug', current: 'jeffallan-claude-skills' },
    description: '66 specialised skills for full-stack developers with 366 reference files. Deep integration with Atlassian (Jira/Confluence via MCP). Structured as Claude Code plugins.',
    url:         'https://github.com/Jeffallan/claude-skills',
    sourceType:  'community',
    platforms:   ['claude-code'],
    domains:     ['engineering', 'general'],
    status:      'published',
    featured:    false,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-antfu-skills',
    _type:       'skillSource',
    name:        'Skills (antfu)',
    slug:        { _type: 'slug', current: 'antfu-skills' },
    description: 'Hand-maintained and auto-generated skills for the Vue/Vite/Nuxt ecosystem. Covers Pinia, VitePress, Vitest, UnoCSS, VueUse, pnpm, Slidev, and Turborepo.',
    url:         'https://github.com/antfu/skills',
    sourceType:  'community',
    platforms:   ['claude-code', 'cursor'],
    domains:     ['engineering'],
    status:      'published',
    featured:    false,
    crawlErrors: 0,
  },

  // ── Aggregators & marketplaces ─────────────────────────────────────────────

  {
    _id:         'skillsource-rohitg00-skillkit',
    _type:       'skillSource',
    name:        'SkillKit (rohitg00)',
    slug:        { _type: 'slug', current: 'rohitg00-skillkit' },
    description: 'Package manager and marketplace for AI agent skills. Aggregates 400K+ skills across 44 AI coding agents including Claude Code, Cursor, Copilot, Windsurf, Devin, Cody, Amazon Q, and Gemini CLI.',
    url:         'https://github.com/rohitg00/skillkit',
    sourceType:  'community',
    platforms:   ['claude-code', 'cursor', 'copilot', 'gemini-cli', 'aider', 'windsurf'],
    domains:     ['engineering', 'devops', 'general'],
    status:      'published',
    featured:    true,
    crawlErrors: 0,
  },

  {
    _id:         'skillsource-awesomeclaude-ai',
    _type:       'skillSource',
    name:        'Awesome Claude Skills (awesomeclaude.ai)',
    slug:        { _type: 'slug', current: 'awesomeclaude-ai' },
    description: 'Visual web directory for Claude skills with 10 categories. Covers Google Workspace, GitHub, Linear, Azure DevOps, Jira, Confluence, Discord, and Telegram integrations.',
    url:         'https://awesomeclaude.ai/awesome-claude-skills',
    sourceType:  'community',
    platforms:   ['claude-code'],
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
