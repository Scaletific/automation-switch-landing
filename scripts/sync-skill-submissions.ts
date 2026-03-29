/**
 * CLI entry point — Notion Skill Submissions → Sanity sync
 * Core logic lives in src/lib/skill-submissions-sync.ts
 *
 * Run:
 *   npx tsx --env-file=.env.local scripts/sync-skill-submissions.ts
 */

import { syncSkillSubmissions } from '../src/lib/skill-submissions-sync'

syncSkillSubmissions()
  .then(r => {
    if (r.errors.length > 0) process.exit(1)
  })
  .catch(err => {
    console.error('[skill-submissions] Fatal:', err)
    process.exit(1)
  })
