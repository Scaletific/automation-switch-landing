/**
 * notion-sync.ts
 * Automation Switch — Notion → Sanity CMS sync library
 *
 * Uses the Notion REST API directly (not the SDK) to remain version-proof.
 * Notion API version: 2022-06-28
 *
 * Flow:
 *   1. Query Notion Articles DB for Status = Ready|Published AND SEO Checklist Complete = ✅
 *   2. Validate required fields per article
 *   3. Look up Author + Category references in Sanity
 *   4. Upload Hero Image to Sanity asset store (Notion URLs expire — must copy to CDN)
 *   5. Fetch page blocks → convert to Sanity Portable Text
 *   6. Parse Key Takeaways + FAQ from structured page sections
 *   7. createOrReplace in Sanity (idempotent — safe to re-run any time)
 *   8. Flip Notion Status: Ready → Published
 *
 * Enforcement layers:
 *   Human  → SEO Checklist Complete checkbox + Status gate in Notion
 *   Script → required-field validation (skips with reason logged)
 *   Sanity → required() schema validators reject incomplete documents
 */

import { createClient } from '@sanity/client'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const NOTION_VERSION = '2022-06-28'
const NOTION_BASE    = 'https://api.notion.com/v1'
const SANITY_PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'l4o4vshf'
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production'

// ─────────────────────────────────────────────────────────────────────────────
// SANITY CLIENT
// ─────────────────────────────────────────────────────────────────────────────

export function getSanityWriteClient() {
  if (!process.env.SANITY_WRITE_TOKEN) throw new Error('SANITY_WRITE_TOKEN is not set')
  return createClient({
    projectId: SANITY_PROJECT,
    dataset:   SANITY_DATASET,
    token:     process.env.SANITY_WRITE_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTION REST HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function notionHeaders(): Record<string, string> {
  const token = process.env.NOTION_API_TOKEN
  if (!token) throw new Error('NOTION_API_TOKEN is not set')
  return {
    'Authorization':  `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type':   'application/json',
  }
}

async function notionPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${NOTION_BASE}${path}`, {
    method:  'POST',
    headers: notionHeaders(),
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Notion API error [${res.status}] ${path}: ${err}`)
  }
  return res.json() as Promise<T>
}

async function notionGet<T>(path: string): Promise<T> {
  const res = await fetch(`${NOTION_BASE}${path}`, {
    method:  'GET',
    headers: notionHeaders(),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Notion API error [${res.status}] ${path}: ${err}`)
  }
  return res.json() as Promise<T>
}

async function notionPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${NOTION_BASE}${path}`, {
    method:  'PATCH',
    headers: notionHeaders(),
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Notion API error [${res.status}] ${path}: ${err}`)
  }
  return res.json() as Promise<T>
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTION TYPES (minimal — only what we use)
// ─────────────────────────────────────────────────────────────────────────────

interface NotionRichText {
  type:        'text' | 'mention' | 'equation'
  plain_text:  string
  href:        string | null
  annotations: {
    bold:          boolean
    italic:        boolean
    strikethrough: boolean
    underline:     boolean
    code:          boolean
    color:         string
  }
  text?: { content: string; link: { url: string } | null }
}

interface NotionBlock {
  id:     string
  object: 'block'
  type:   string
  [blockType: string]: unknown
}

interface NotionPage {
  id:         string
  object:     'page'
  properties: Record<string, NotionProperty>
}

type NotionProperty =
  | { type: 'title';        title:        NotionRichText[] }
  | { type: 'rich_text';    rich_text:    NotionRichText[] }
  | { type: 'url';          url:          string | null }
  | { type: 'select';       select:       { name: string } | null }
  | { type: 'multi_select'; multi_select: { name: string }[] }
  | { type: 'checkbox';     checkbox:     boolean }
  | { type: 'date';         date:         { start: string } | null }
  | { type: 'number';       number:       number | null }

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SyncResult {
  synced:   string[]
  skipped:  { title: string; reason: string }[]
  errors:   { title: string; error: string }[]
  duration: number
}

interface PortableTextSpan {
  _type:  'span'
  _key:   string
  text:   string
  marks:  string[]
}

interface PortableTextMarkDef {
  _type: string
  _key:  string
  href?: string
}

interface PortableTextBlock {
  _type:     'block'
  _key:      string
  style:     string
  listItem?: string
  level?:    number
  markDefs:  PortableTextMarkDef[]
  children:  PortableTextSpan[]
}

interface FAQItem {
  question: string
  answer:   string
}

// ─────────────────────────────────────────────────────────────────────────────
// KEY GENERATION
// ─────────────────────────────────────────────────────────────────────────────

let _keyCounter = 0
function key(): string {
  return `k${Date.now().toString(36)}${(++_keyCounter).toString(36)}`
}

// ─────────────────────────────────────────────────────────────────────────────
// RICH TEXT → PORTABLE TEXT SPANS
// ─────────────────────────────────────────────────────────────────────────────

function richTextToSpans(richText: NotionRichText[]): {
  spans:    PortableTextSpan[]
  markDefs: PortableTextMarkDef[]
} {
  const spans:    PortableTextSpan[]    = []
  const markDefs: PortableTextMarkDef[] = []

  for (const rt of richText) {
    if (rt.type !== 'text') continue
    const marks: string[] = []

    if (rt.annotations.bold)          marks.push('strong')
    if (rt.annotations.italic)        marks.push('em')
    if (rt.annotations.code)          marks.push('code')
    if (rt.annotations.strikethrough) marks.push('strike-through')

    const href = rt.href ?? rt.text?.link?.url
    if (href) {
      const linkKey = key()
      markDefs.push({ _type: 'link', _key: linkKey, href })
      marks.push(linkKey)
    }

    spans.push({ _type: 'span', _key: key(), text: rt.plain_text, marks })
  }

  // Sanity requires at least one child span per block
  if (spans.length === 0) {
    spans.push({ _type: 'span', _key: key(), text: '', marks: [] })
  }

  return { spans, markDefs }
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK → PORTABLE TEXT
// ─────────────────────────────────────────────────────────────────────────────

function getBlockRichText(block: NotionBlock, type: string): NotionRichText[] {
  const blockData = block[type] as Record<string, unknown> | undefined
  if (!blockData) return []
  return (blockData.rich_text as NotionRichText[]) ?? []
}

function convertBlock(block: NotionBlock): PortableTextBlock | null {
  const k = key()

  const simpleBlock = (style: string, richText: NotionRichText[]): PortableTextBlock => {
    const { spans, markDefs } = richTextToSpans(richText)
    return { _type: 'block', _key: k, style, markDefs, children: spans }
  }

  const listBlock = (listItem: string, richText: NotionRichText[]): PortableTextBlock => {
    const { spans, markDefs } = richTextToSpans(richText)
    return { _type: 'block', _key: k, style: 'normal', listItem, level: 1, markDefs, children: spans }
  }

  switch (block.type) {
    case 'paragraph':           return simpleBlock('normal',     getBlockRichText(block, 'paragraph'))
    case 'heading_1':           return simpleBlock('h1',         getBlockRichText(block, 'heading_1'))
    case 'heading_2':           return simpleBlock('h2',         getBlockRichText(block, 'heading_2'))
    case 'heading_3':           return simpleBlock('h3',         getBlockRichText(block, 'heading_3'))
    case 'quote':               return simpleBlock('blockquote', getBlockRichText(block, 'quote'))
    case 'bulleted_list_item':  return listBlock('bullet',       getBlockRichText(block, 'bulleted_list_item'))
    case 'numbered_list_item':  return listBlock('number',       getBlockRichText(block, 'numbered_list_item'))
    default:                    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK PLAIN TEXT (for section detection)
// ─────────────────────────────────────────────────────────────────────────────

function getPlainText(block: NotionBlock): string {
  const types = [
    'heading_1', 'heading_2', 'heading_3',
    'paragraph', 'bulleted_list_item', 'numbered_list_item', 'quote',
  ]
  for (const t of types) {
    if (block.type === t) {
      return getBlockRichText(block, t).map(rt => rt.plain_text).join('').trim()
    }
  }
  return ''
}

function isHeading(block: NotionBlock): boolean {
  return block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3'
}

// ─────────────────────────────────────────────────────────────────────────────
// ARTICLE BODY EXTRACTION
// Extracts only the article draft content — stops at Research / Artefacts
// sections so that template scaffolding never leaks into the published article.
// ─────────────────────────────────────────────────────────────────────────────

const STOP_SECTIONS = [
  'research', 'research artefacts', 'supporting artefacts', 'distribution plan',
  '🔍 research', '🧩 supporting artefacts', '📤 distribution plan', '⬡ seo',
  'seo & schema checklist',
]

function extractArticleBody(blocks: NotionBlock[]): NotionBlock[] {
  const body: NotionBlock[] = []
  let collecting = false

  for (const block of blocks) {
    const text = getPlainText(block).toLowerCase()

    if (isHeading(block) && text.includes('article draft')) {
      collecting = true
      continue
    }

    if (isHeading(block) && STOP_SECTIONS.some(s => text.includes(s))) break

    if (collecting) body.push(block)
  }

  // Fallback: no "Article Draft" heading → use everything until a stop section
  if (body.length === 0) {
    for (const block of blocks) {
      const text = getPlainText(block).toLowerCase()
      if (isHeading(block) && STOP_SECTIONS.some(s => text.includes(s))) break
      body.push(block)
    }
  }

  return body
}

// ─────────────────────────────────────────────────────────────────────────────
// KEY TAKEAWAYS EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

function extractKeyTakeaways(blocks: NotionBlock[]): string[] {
  const items: string[] = []
  let inSection = false

  for (const block of blocks) {
    const text = getPlainText(block)

    if (isHeading(block) && text.toLowerCase().includes('key takeaway')) {
      inSection = true
      continue
    }

    if (inSection) {
      if (isHeading(block)) break
      if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
        const item = text.replace(/^[-*•]\s*/, '').trim()
        if (item && !item.startsWith('[')) items.push(item)
      }
    }
  }

  return items
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

function extractFAQ(blocks: NotionBlock[]): FAQItem[] {
  const faq: FAQItem[] = []
  let inFAQ             = false
  let currentQ: string | null = null
  let answerParts: string[]   = []

  const flush = () => {
    if (currentQ && answerParts.length) {
      faq.push({ question: currentQ, answer: answerParts.join(' ').trim() })
      currentQ    = null
      answerParts = []
    }
  }

  for (const block of blocks) {
    const text      = getPlainText(block)
    const textLower = text.toLowerCase()

    if (isHeading(block) && (textLower.includes('faq') || textLower.includes('frequently asked'))) {
      inFAQ = true
      continue
    }

    if (!inFAQ) continue

    if ((block.type === 'heading_1' || block.type === 'heading_2') &&
        !textLower.includes('faq') && !textLower.includes('frequently')) {
      flush()
      break
    }

    if (block.type === 'heading_3') {
      flush()
      currentQ = text
      continue
    }

    if (block.type === 'paragraph' && currentQ && text && !text.startsWith('[')) {
      answerParts.push(text)
    }
  }

  flush()
  return faq
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE UPLOAD
// ─────────────────────────────────────────────────────────────────────────────

async function uploadImage(
  imageUrl: string,
  sanity: ReturnType<typeof getSanityWriteClient>
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(20_000) })
    if (!res.ok) {
      console.warn(`[sync] Image fetch ${res.status}: ${imageUrl}`)
      return null
    }
    const buffer      = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const filename    = imageUrl.split('?')[0].split('/').pop() ?? 'hero.jpg'
    const asset       = await sanity.assets.upload('image', buffer, { filename, contentType })
    return asset._id
  } catch (err) {
    console.warn('[sync] Image upload failed:', err instanceof Error ? err.message : err)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SANITY REFERENCE LOOKUPS
// ─────────────────────────────────────────────────────────────────────────────

async function findAuthor(name: string, sanity: ReturnType<typeof getSanityWriteClient>): Promise<string | null> {
  const r = await sanity.fetch<{ _id: string } | null>(
    `*[_type == "author" && name == $name][0]{ _id }`, { name }
  )
  return r?._id ?? null
}

async function findCategory(title: string, sanity: ReturnType<typeof getSanityWriteClient>): Promise<string | null> {
  const r = await sanity.fetch<{ _id: string } | null>(
    `*[_type == "category" && lower(title) == lower($title)][0]{ _id }`, { title }
  )
  return r?._id ?? null
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTION PROPERTY ACCESSORS
// ─────────────────────────────────────────────────────────────────────────────

function getProp(page: NotionPage, name: string): NotionProperty | undefined {
  return page.properties[name]
}

function getText(page: NotionPage, name: string): string {
  const p = getProp(page, name)
  if (!p) return ''
  if (p.type === 'title')     return p.title.map(t => t.plain_text).join('')
  if (p.type === 'rich_text') return p.rich_text.map(t => t.plain_text).join('')
  if (p.type === 'url')       return p.url ?? ''
  return ''
}

function getSelect(page: NotionPage, name: string): string {
  const p = getProp(page, name)
  return p?.type === 'select' ? (p.select?.name ?? '') : ''
}

function getMultiSelect(page: NotionPage, name: string): string[] {
  const p = getProp(page, name)
  return p?.type === 'multi_select' ? p.multi_select.map(o => o.name) : []
}

function getCheckbox(page: NotionPage, name: string): boolean {
  const p = getProp(page, name)
  return p?.type === 'checkbox' ? p.checkbox : false
}

function getDate(page: NotionPage, name: string): string | null {
  const p = getProp(page, name)
  return p?.type === 'date' ? (p.date?.start ?? null) : null
}

function getNumber(page: NotionPage, name: string): number | null {
  const p = getProp(page, name)
  return p?.type === 'number' ? p.number : null
}

// ─────────────────────────────────────────────────────────────────────────────
// SLUG GENERATION
// ─────────────────────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96)
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTION DB QUERY (REST — version-proof)
// ─────────────────────────────────────────────────────────────────────────────

interface NotionQueryResponse {
  results:     NotionPage[]
  has_more:    boolean
  next_cursor: string | null
}

async function queryNotionDB(dbId: string, filter: unknown): Promise<NotionPage[]> {
  const pages: NotionPage[] = []
  let cursor: string | undefined

  do {
    const body: Record<string, unknown> = { filter, page_size: 100 }
    if (cursor) body.start_cursor = cursor

    const response = await notionPost<NotionQueryResponse>(`/databases/${dbId}/query`, body)

    for (const result of response.results) {
      if ('properties' in result) pages.push(result as NotionPage)
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  return pages
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTION PAGE BLOCKS (REST — paginated)
// ─────────────────────────────────────────────────────────────────────────────

interface NotionBlocksResponse {
  results:     NotionBlock[]
  has_more:    boolean
  next_cursor: string | null
}

async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = []
  let cursor: string | undefined

  do {
    const path = cursor
      ? `/blocks/${pageId}/children?page_size=100&start_cursor=${cursor}`
      : `/blocks/${pageId}/children?page_size=100`

    const response = await notionGet<NotionBlocksResponse>(path)
    blocks.push(...response.results.filter(b => b.object === 'block'))
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  return blocks
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SYNC FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export async function syncNotionToSanity(): Promise<SyncResult> {
  const startTime = Date.now()
  const sanity    = getSanityWriteClient()
  const dbId      = process.env.NOTION_ARTICLES_DB_ID

  if (!dbId) throw new Error('NOTION_ARTICLES_DB_ID is not set')

  const result: SyncResult = { synced: [], skipped: [], errors: [], duration: 0 }

  // ── 1. Fetch eligible articles ────────────────────────────────────────────

  const pages = await queryNotionDB(dbId, {
    and: [
      {
        or: [
          { property: 'Status', select: { equals: 'Ready' } },
          { property: 'Status', select: { equals: 'Published' } },
        ],
      },
      { property: 'SEO Checklist Complete', checkbox: { equals: true } },
    ],
  })

  console.log(`[sync] ${pages.length} eligible article(s)`)

  // ── 2. Process each article ───────────────────────────────────────────────

  for (const page of pages) {
    const title = getText(page, 'Title') || 'Untitled'

    try {
      // ── Validate required fields ───────────────────────────────────────────

      const authorName   = getText(page, 'Author')
      const categoryName = getSelect(page, 'Category')
      const excerpt      = getText(page, 'Excerpt')
      const heroImageUrl = getText(page, 'Hero Image URL')
      const publishedAt  = getDate(page, 'Publish Date')

      const missing: string[] = []
      if (!authorName)   missing.push('Author')
      if (!categoryName) missing.push('Category')
      if (!excerpt)      missing.push('Excerpt')
      if (!heroImageUrl) missing.push('Hero Image URL')
      if (!publishedAt)  missing.push('Publish Date')

      if (missing.length) {
        const reason = `Missing: ${missing.join(', ')}`
        console.warn(`[sync] SKIP "${title}" — ${reason}`)
        result.skipped.push({ title, reason })
        continue
      }

      // ── Sanity reference lookups ───────────────────────────────────────────

      const authorId = await findAuthor(authorName, sanity)
      if (!authorId) {
        const reason = `Author "${authorName}" not in Sanity — create author document first`
        console.warn(`[sync] SKIP "${title}" — ${reason}`)
        result.skipped.push({ title, reason })
        continue
      }

      const categoryId = await findCategory(categoryName, sanity)
      if (!categoryId) {
        const reason = `Category "${categoryName}" not in Sanity — create category document first`
        console.warn(`[sync] SKIP "${title}" — ${reason}`)
        result.skipped.push({ title, reason })
        continue
      }

      // ── Upload hero image ──────────────────────────────────────────────────

      const heroAssetId = await uploadImage(heroImageUrl, sanity)
      if (!heroAssetId) {
        const reason = `Hero image upload failed: ${heroImageUrl}`
        console.warn(`[sync] SKIP "${title}" — ${reason}`)
        result.skipped.push({ title, reason })
        continue
      }

      // ── Fetch and parse page blocks ────────────────────────────────────────

      const allBlocks = await getPageBlocks(page.id)

      const bodyBlocks        = extractArticleBody(allBlocks)
      const portableBody      = bodyBlocks.map(convertBlock).filter((b): b is PortableTextBlock => b !== null)
      const keyTakeaways      = extractKeyTakeaways(allBlocks)
      const faq               = extractFAQ(allBlocks)

      // Fallback: key takeaways from DB property if page body has none
      const propTakeaways = getText(page, 'Key Takeaways')
        .split('\n')
        .map(l => l.replace(/^[-*•\[\]x ]/g, '').trim())
        .filter(l => l.length > 2)

      const finalTakeaways = keyTakeaways.length > 0 ? keyTakeaways : propTakeaways

      // ── Build Sanity document ──────────────────────────────────────────────

      // Stable, deterministic ID — enables idempotent re-sync
      const docId = `notion-${page.id.replace(/-/g, '')}`

      const sanityDoc: Record<string, unknown> & { _id: string; _type: string } = {
        _id:   docId,
        _type: 'article',

        title,
        slug: { _type: 'slug', current: toSlug(title) },

        author:   { _type: 'reference', _ref: authorId },
        category: { _type: 'reference', _ref: categoryId },

        heroImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: heroAssetId },
          alt:   `Featured image for: ${title}`,
        },

        excerpt,
        body: portableBody,

        publishedAt:  new Date(publishedAt!).toISOString(),
        lastModified: new Date().toISOString(),

        readTime: getNumber(page, 'Read Time'),
        featured: getCheckbox(page, 'Featured'),
        tags:     getMultiSelect(page, 'Tags').map(t => t.toLowerCase()),

        seo: {
          ...(getText(page, 'Meta Title')       && { metaTitle:       getText(page, 'Meta Title') }),
          ...(getText(page, 'Meta Description') && { metaDescription: getText(page, 'Meta Description') }),
        },
      }

      if (finalTakeaways.length > 0) {
        sanityDoc.keyTakeaways = finalTakeaways
      }

      if (faq.length > 0) {
        sanityDoc.faq = faq.map((item, i) => ({
          _type: 'faqItem',
          _key:  `faq-${i}`,
          question: item.question,
          answer:   item.answer,
        }))
      }

      // ── Upsert ────────────────────────────────────────────────────────────

      await sanity.createOrReplace(sanityDoc)
      console.log(`[sync] ✓ "${title}" → ${docId}`)

      // ── Promote: Ready → Published ─────────────────────────────────────────

      if (getSelect(page, 'Status') === 'Ready') {
        await notionPatch(`/pages/${page.id}`, {
          properties: { Status: { select: { name: 'Published' } } },
        })
        console.log(`[sync]   Status: Ready → Published`)
      }

      result.synced.push(title)

    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      console.error(`[sync] ✗ "${title}":`, error)
      result.errors.push({ title, error })
    }
  }

  result.duration = Date.now() - startTime
  console.log(
    `[sync] Done ${result.duration}ms — ` +
    `✓ ${result.synced.length} · ⊘ ${result.skipped.length} · ✗ ${result.errors.length}`
  )

  return result
}
