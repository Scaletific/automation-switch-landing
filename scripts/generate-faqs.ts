/**
 * generate-faqs.ts — Generates FAQ entries for articles using Claude, then patches Sanity.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/generate-faqs.ts
 *
 * Options:
 *   --slug <slug>   Only process the article with this slug (otherwise processes all without FAQs)
 *   --dry-run       Print generated FAQs without writing to Sanity
 *
 * Requires in .env.local:
 *   SANITY_WRITE_TOKEN=...
 *   ANTHROPIC_API_KEY=...
 */

import { createClient } from '@sanity/client'
import Anthropic from '@anthropic-ai/sdk'
import crypto from 'crypto'

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'l4o4vshf'
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production'
const TOKEN      = process.env.SANITY_WRITE_TOKEN
const AI_KEY     = process.env.ANTHROPIC_API_KEY

if (!TOKEN) {
  console.error('\n❌  SANITY_WRITE_TOKEN is not set in .env.local\n')
  process.exit(1)
}
if (!AI_KEY) {
  console.error('\n❌  ANTHROPIC_API_KEY is not set in .env.local\n')
  process.exit(1)
}

const args = process.argv.slice(2)
const slugFilter = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null
const dryRun = args.includes('--dry-run')

const sanity = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false,
})

const anthropic = new Anthropic({ apiKey: AI_KEY })

// ── Types ─────────────────────────────────────────────────────────────────────

interface FaqItem { _key: string; question: string; answer: string }

interface ArticleRaw {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  body: any[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Converts Portable Text blocks to a plain text string for the LLM prompt */
function blocksToText(blocks: any[]): string {
  if (!blocks) return ''
  return blocks
    .filter(b => b._type === 'block' && b.children)
    .map(b => b.children.map((c: any) => c.text ?? '').join(''))
    .filter(Boolean)
    .join('\n\n')
    .slice(0, 8000) // stay comfortably within context
}

/** Calls Claude to generate FAQ items for an article */
async function generateFaqs(article: ArticleRaw): Promise<FaqItem[]> {
  const bodyText = blocksToText(article.body)

  const prompt = `You are writing FAQ entries for a published article on Automation Switch, a site for builders using AI agents and automation tools.

Article title: ${article.title}
Article excerpt: ${article.excerpt}

Article body:
${bodyText}

Generate exactly 5 FAQ entries that a reader would genuinely want answered after reading this article. Requirements:
- Questions should be specific to this article's content (not generic)
- Answers should be 2–4 sentences, informative, and written in a direct, professional tone
- No fluff, no "Great question!", no markdown in answers
- Cover different aspects of the article (not variations of the same question)

Respond with a JSON array only, no preamble:
[
  { "question": "...", "answer": "..." },
  ...
]`

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error(`Claude returned no JSON array:\n${text}`)

  const raw: { question: string; answer: string }[] = JSON.parse(jsonMatch[0])
  return raw.map(item => ({
    _key: crypto.randomUUID().replace(/-/g, '').slice(0, 12),
    question: item.question,
    answer: item.answer,
  }))
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const query = slugFilter
    ? `*[_type == "article" && slug.current == "${slugFilter}"] { _id, title, slug, excerpt, body }`
    : `*[_type == "article" && (!defined(faq) || length(faq) == 0)] { _id, title, slug, excerpt, body }`

  const articles: ArticleRaw[] = await sanity.fetch(query)

  if (articles.length === 0) {
    console.log('✅  No articles need FAQ generation.')
    return
  }

  console.log(`\n📝  Generating FAQs for ${articles.length} article(s)${dryRun ? ' (dry-run)' : ''}...\n`)

  for (const article of articles) {
    const slug = article.slug.current
    console.log(`→ ${article.title} (${slug})`)

    try {
      const faqs = await generateFaqs(article)

      if (dryRun) {
        console.log('   FAQs:')
        faqs.forEach((f, i) => console.log(`   ${i + 1}. Q: ${f.question}\n      A: ${f.answer}`))
        console.log()
        continue
      }

      await sanity.patch(article._id).set({ faq: faqs }).commit()
      console.log(`   ✅  Patched ${faqs.length} FAQ items\n`)
    } catch (err) {
      console.error(`   ❌  Failed: ${(err as Error).message}\n`)
    }
  }

  console.log(dryRun ? '— Dry run complete, nothing written.' : '— Done.')
}

main()
