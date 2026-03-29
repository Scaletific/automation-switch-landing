import { NextRequest, NextResponse } from 'next/server'

const NOTION_TOKEN = process.env.NOTION_API_TOKEN
const SUBMISSIONS_DB_ID = process.env.NOTION_SUBMISSIONS_DB_ID

async function notionPost(endpoint: string, body: unknown) {
  const res = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Notion API error ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const { name, url, description, platforms, domains, submitterEmail } = await req.json()

    if (!name || !url || !description) {
      return NextResponse.json({ error: 'name, url, and description are required' }, { status: 400 })
    }

    // Basic URL validation
    try { new URL(url) } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (!NOTION_TOKEN || !SUBMISSIONS_DB_ID) {
      // Graceful fallback: log and return success so the form UX isn't broken
      // while env vars are being configured
      console.warn('[skills/submit] Missing NOTION_TOKEN or SUBMISSIONS_DB_ID — submission not saved')
      return NextResponse.json({ ok: true, warning: 'Submission logged but not saved — env vars not configured' })
    }

    await notionPost('/pages', {
      parent: { database_id: SUBMISSIONS_DB_ID },
      properties: {
        'Name':        { title:     [{ text: { content: name } }] },
        'URL':         { url:       url },
        'Description': { rich_text: [{ text: { content: description } }] },
        'Platforms':   { rich_text: [{ text: { content: (platforms as string[]).join(', ') } }] },
        'Domains':     { rich_text: [{ text: { content: (domains as string[]).join(', ')   } }] },
        'Submitted By':{ email:     submitterEmail ?? null },
        'Status':      { select:    { name: 'Pending' } },
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[skills/submit]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}
