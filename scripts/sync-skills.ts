/**
 * CLI entry point — Firecrawl/GitHub skill count updater
 * Core logic lives in src/lib/skills-sync.ts
 *
 * Run:
 *   npx tsx --env-file=.env.local scripts/sync-skills.ts
 */

import { syncSkillCounts } from '../src/lib/skills-sync'

syncSkillCounts()
  .then(r => {
    if (r.failed.length > 0) process.exit(1)
  })
  .catch(err => {
    console.error('[skills-sync] Fatal:', err)
    process.exit(1)
  })
