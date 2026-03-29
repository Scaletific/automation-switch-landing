# Automation Switch — System Architecture

A complete reference for how all platforms, databases, scripts, and services
connect. Read top-to-bottom: data originates in Notion, flows through the sync
layer into Sanity, and is served to users by the Next.js app on Vercel.

---

```text
╔══════════════════════════════════════════════════════════════════════════════════╗
║                        AUTOMATION SWITCH — SYSTEM MAP                          ║
╚══════════════════════════════════════════════════════════════════════════════════╝

  ┌─────────────────────────────────────┐
  │              NOTION                 │
  │        (notion.so workspace)        │
  │                                     │
  │  ┌─────────────────┐                │
  │  │   Articles DB   │ ← NOTION_DB_ID │
  │  │                 │                │
  │  │  Title          │ text           │
  │  │  Body           │ rich text      │
  │  │  Status         │ select         │
  │  │  Slug           │ text           │
  │  │  Tags           │ multi-select   │
  │  │  SEO Title      │ text           │
  │  │  SEO Desc       │ text           │
  │  │  Published At   │ date           │
  │  │                 │                │
  │  │  ► Only pages   │                │
  │  │    with Status  │                │
  │  │    = "Published"│                │
  │  │    get synced   │                │
  │  └────────┬────────┘                │
  │           │                         │
  │  ┌────────▼─────────────────────┐   │
  │  │    Skill Submissions DB      │   │
  │  │                 ← SUBMISSIONS_DB_ID
  │  │                              │   │
  │  │  Name           text         │   │
  │  │  URL            url          │   │
  │  │  Description    text         │   │
  │  │  Platforms      multi-select │   │
  │  │  Domains        multi-select │   │
  │  │  Submitter      email        │   │
  │  │  Status         select       │   │
  │  │                 (Pending /   │   │
  │  │                  Approved /  │   │
  │  │                  Rejected)   │   │
  │  │                              │   │
  │  │  ► Populated by /api/skills/ │   │
  │  │    submit when someone fills │   │
  │  │    out the web form          │   │
  │  │  ► You review here, then     │   │
  │  │    manually add to Sanity    │   │
  │  └──────────────────────────────┘   │
  │                                     │
  │  SETUP: Share your Notion           │
  │  integration with BOTH databases    │
  │  via Settings → Connections         │
  └──────────────┬──────────────────────┘
                 │
                 │  Auth: NOTION_API_TOKEN
                 │  Protocol: REST API v2022-06-28
                 │  (fetch() directly — no SDK)
                 │
  ┌──────────────▼──────────────────────────────────────────────┐
  │                      SYNC LAYER                             │
  │                  (runs inside Vercel)                       │
  │                                                             │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  src/lib/notion-sync.ts                              │   │
  │  │                                                      │   │
  │  │  1. Fetches all Published pages from Articles DB     │   │
  │  │  2. Transforms Notion blocks → Portable Text         │   │
  │  │  3. Maps fields to Sanity article schema             │   │
  │  │  4. Calls sanity.createOrReplace() — idempotent,     │   │
  │  │     safe to run as many times as needed              │   │
  │  └──────────────────────────────────────────────────────┘   │
  │                                                             │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  src/app/api/sync/notion/route.ts                    │   │
  │  │                                                      │   │
  │  │  POST endpoint that triggers notion-sync.ts          │   │
  │  │  Protected by x-sync-secret header check             │   │
  │  │  Returns { synced: N } on success                    │   │
  │  └──────────────────────────────────────────────────────┘   │
  │                                                             │
  │  HOW IT GETS TRIGGERED — two paths:                         │
  │                                                             │
  │  ┌───────────────────────┐  ┌──────────────────────────┐   │
  │  │   Vercel Cron Job     │  │   Manual curl (you)      │   │
  │  │   vercel.json         │  │                          │   │
  │  │   schedule:           │  │  curl -X POST \          │   │
  │  │   "*/30 * * * *"      │  │  https://automationswitch│   │
  │  │   (every 30 min)      │  │  .com/api/sync/notion \  │   │
  │  │                       │  │  -H "x-sync-secret: ***" │   │
  │  └───────────┬───────────┘  └─────────────┬────────────┘   │
  │              └──────────────┬──────────────┘               │
  │                             ▼                               │
  │                  POST /api/sync/notion                      │
  └─────────────────────────┬───────────────────────────────────┘
                             │
                             │  Auth: SANITY_WRITE_TOKEN (Editor role)
                             │  Protocol: Sanity JS client + GROQ
                             │
  ┌──────────────────────────▼──────────────────────────────────┐
  │                       SANITY CMS                            │
  │              (sanity.io — project NEXT_PUBLIC_SANITY_        │
  │               PROJECT_ID, dataset: production)              │
  │                                                             │
  │  DOCUMENT TYPES (schemas in /sanity/schemaTypes/):          │
  │                                                             │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  article                                             │   │
  │  │  title, slug, body (Portable Text), author->,        │   │
  │  │  heroImage, category->, tags[], publishedAt,         │   │
  │  │  keyTakeaways[], faq[], seo{}, lastModified          │   │
  │  │  ► Populated by notion-sync.ts                       │   │
  │  └──────────────────────────────────────────────────────┘   │
  │                                                             │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  author                                              │   │
  │  │  name, slug, role, bio, avatar, social{}             │   │
  │  │  ► Seeded by scripts/seed-sanity.ts                  │   │
  │  │  ► Current: Michael Nouriel (author-michael-nouriel) │   │
  │  └──────────────────────────────────────────────────────┘   │
  │                                                             │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  category                                            │   │
  │  │  title, slug, description                            │   │
  │  │  ► Seeded by scripts/seed-sanity.ts                  │   │
  │  │  ► 5 created: deep-dive, tutorial, tools,            │   │
  │  │    case-study, opinion                               │   │
  │  └──────────────────────────────────────────────────────┘   │
  │                                                             │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  skillSource                                         │   │
  │  │  name, slug, sourceType, url, description,           │   │
  │  │  platforms[], domains[], installCommand,             │   │
  │  │  skillCount, skillCountPrev, skillCountUpdatedAt,    │   │
  │  │  lastCrawledAt, crawlErrors[], status, featured      │   │
  │  │  ► Manually added in Sanity Studio (/studio)         │   │
  │  │  ► skillCount kept in sync by Firecrawl script       │   │
  │  │    (scripts/sync-skills.ts — TODO)                   │   │
  │  └──────────────────────────────────────────────────────┘   │
  │                                                             │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  siteSettings  (singleton — one document only)       │   │
  │  │  skillsHubLive: bool  ← toggle /skills CTA on/off   │   │
  │  │  maintenanceMode: bool                               │   │
  │  │  announcementBar { enabled, message, linkUrl }       │   │
  │  │  ► Edited directly in Sanity Studio (/studio)        │   │
  │  │  ► No code deploy needed to flip these flags         │   │
  │  └──────────────────────────────────────────────────────┘   │
  │                                                             │
  │  STUDIO URL: https://automationswitch.com/studio            │
  └─────────────────────────┬───────────────────────────────────┘
                             │
                             │  Auth: NEXT_PUBLIC_SANITY_PROJECT_ID
                             │        NEXT_PUBLIC_SANITY_DATASET
                             │        SANITY_API_TOKEN (read-only)
                             │  Protocol: GROQ queries via sanity client
                             │
  ┌──────────────────────────▼──────────────────────────────────┐
  │               NEXT.JS APP  (Vercel)                         │
  │           https://automationswitch.com                      │
  │                                                             │
  │  PAGES:                                                     │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  /articles/[slug]    revalidate: 60s (ISR)           │   │
  │  │  Full article with author byline, hero image,        │   │
  │  │  key takeaways, FAQ accordion, JSON-LD structured    │   │
  │  │  data (Article + BreadcrumbList + FAQPage)           │   │
  │  └──────────────────────────────────────────────────────┘   │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  /skills             revalidate: 3600s (ISR)         │   │
  │  │  Skills hub directory, filter by platform/domain,    │   │
  │  │  featured cards, install command copy button         │   │
  │  │  JSON-LD: CollectionPage                             │   │
  │  └──────────────────────────────────────────────────────┘   │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  /skills/[slug]      revalidate: 3600s (ISR)         │   │
  │  │  Individual skill source page, stats sidebar,        │   │
  │  │  JSON-LD: WebPage + BreadcrumbList                   │   │
  │  └──────────────────────────────────────────────────────┘   │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  /skills/submit      'use client'                    │   │
  │  │  Community submission form — name, URL, description, │   │
  │  │  platform toggles, domain toggles, email             │   │
  │  │  POSTs to /api/skills/submit → creates Notion page   │   │
  │  └──────────────────────────────────────────────────────┘   │
  │                                                             │
  │  API ROUTES:                                                │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  POST /api/sync/notion                               │   │
  │  │  Protected: x-sync-secret header required            │   │
  │  │  Triggers: notion-sync.ts                            │   │
  │  └──────────────────────────────────────────────────────┘   │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  POST /api/skills/submit                             │   │
  │  │  Validates form fields, creates Notion page in       │   │
  │  │  Skill Submissions DB with Status: Pending           │   │
  │  └──────────────────────────────────────────────────────┘   │
  └─────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
                    [ READERS / BUILDERS ]


══════════════════════════════════════════════════════════════════
  LOCAL DEV & SCRIPTS
══════════════════════════════════════════════════════════════════

  ┌──────────────────────────────────────────────────────────────┐
  │  .env.local  (never committed to git)                        │
  │                                                              │
  │  Variable                    Where it comes from            │
  │  ─────────────────────────── ──────────────────────────────  │
  │  NOTION_API_TOKEN            Notion → Settings →            │
  │                              Connections → Integrations      │
  │                                                              │
  │  NOTION_DB_ID                Articles DB URL →              │
  │                              notion.so/.../{THIS_ID}?v=...  │
  │                                                              │
  │  SUBMISSIONS_DB_ID           Skill Submissions DB URL        │
  │                              same pattern as above          │
  │                                                              │
  │  NEXT_PUBLIC_SANITY_         Sanity.io → project →          │
  │    PROJECT_ID                Settings → API                 │
  │                                                              │
  │  NEXT_PUBLIC_SANITY_         "production" (default)         │
  │    DATASET                                                   │
  │                                                              │
  │  SANITY_API_TOKEN            Sanity → Settings → API →      │
  │    (read-only)               Tokens → Add (Viewer role)     │
  │                                                              │
  │  SANITY_WRITE_TOKEN          Sanity → Settings → API →      │
  │    (Editor role)             Tokens → Add (Editor role)     │
  │                              Used only by sync script       │
  │                                                              │
  │  SYNC_SECRET                 Generated once:                │
  │                              openssl rand -hex 32           │
  │                              Add to Vercel env vars too     │
  │                                                              │
  │  BEEHIIV_API_KEY             Beehiiv dashboard → API        │
  │  BEEHIIV_PUBLICATION_ID      (pending — not yet added)      │
  └──────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────┐
  │  scripts/seed-sanity.ts                                      │
  │                                                              │
  │  Run ONCE (or re-run safely — uses createOrReplace):        │
  │  npx tsx --env-file=.env.local scripts/seed-sanity.ts        │
  │                                                              │
  │  Creates:                                                    │
  │    • 5 categories (deep-dive, tutorial, tools,              │
  │      case-study, opinion)                                    │
  │    • Author: Michael Nouriel (author-michael-nouriel)        │
  └──────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────┐
  │  scripts/sync-skill-submissions.ts                           │
  │                                                              │
  │  Run: npx tsx --env-file=.env.local \                        │
  │         scripts/sync-skill-submissions.ts                    │
  │  Or triggered via POST /api/sync/skill-submissions           │
  │                                                              │
  │  Flow:                                                       │
  │    1. Query Notion Submissions DB for Status = "Approved"    │
  │    2. Validate required fields (name, url, description)      │
  │    3. Create skillSource doc in Sanity                       │
  │       • status: "pending-review" (not auto-published)        │
  │       • Preserves human editorial gate: editor sets          │
  │         featured + status=published in Studio                │
  │    4. Flip Notion entry Status: Approved → Synced            │
  │    5. Returns { synced, skipped, errors } summary            │
  │                                                              │
  │  Auth needed:                                                │
  │    NOTION_API_TOKEN, NOTION_SUBMISSIONS_DB_ID,               │
  │    SANITY_WRITE_TOKEN (all already in .env.local)            │
  └──────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────┐
  │  scripts/sync-skills.ts                                      │
  │                                                              │
  │  Run: npx tsx --env-file=.env.local scripts/sync-skills.ts   │
  │  Or triggered via POST /api/sync/skills (weekly Vercel cron) │
  │                                                              │
  │  Flow:                                                       │
  │    1. Fetch all published skillSource docs from Sanity       │
  │    2. For each source, use Firecrawl to scrape the URL       │
  │       and count SKILL.md / skill.md files found              │
  │    3. If count differs from current skillCount:              │
  │       • skillCountPrev = old skillCount                      │
  │       • skillCount     = new count                           │
  │       • skillCountUpdatedAt = now                            │
  │    4. Always write lastCrawledAt = now                       │
  │    5. On crawl failure: increment crawlErrors;               │
  │       at 3+ consecutive failures flag for review             │
  │    6. Patch Sanity doc via SANITY_WRITE_TOKEN                │
  │                                                              │
  │  Auth needed:                                                │
  │    SANITY_API_TOKEN, SANITY_WRITE_TOKEN (existing)           │
  │    FIRECRAWL_API_KEY  ← NEW: firecrawl.dev → API Keys        │
  └──────────────────────────────────────────────────────────────┘


══════════════════════════════════════════════════════════════════
  DATA FLOWS
══════════════════════════════════════════════════════════════════

  ARTICLE PUBLISH FLOW:
  ─────────────────────
  1. Write article in Notion (Articles DB)
  2. Fill all required fields, set Status = "Published"
  3. Wait up to 30 min for Vercel Cron  — OR —
     curl -X POST https://automationswitch.com/api/sync/notion \
       -H "x-sync-secret: <SYNC_SECRET>"
  4. notion-sync.ts fetches the page, transforms to Sanity doc
  5. Sanity article document created / updated
  6. Next.js page revalidates within 60s via ISR
  7. Article is live at /articles/{slug}

  SKILLS HUB UPDATE FLOW:
  ────────────────────────
  1. Receive submission at /skills/submit (web form)
     → Notion Skill Submissions DB entry created (Status: Pending)
  2. Review submission in Notion, set Status = Approved
  3. sync-skill-submissions.ts runs (cron or manual):
     → Picks up Approved entries, creates skillSource doc in Sanity
       with status: "pending-review"
     → Flips Notion entry: Approved → Synced (idempotent)
  4. Editor opens Sanity Studio (/studio):
     → Sets featured: true if desired
     → Sets status: "published" to make it live
  5. /skills revalidates within 3600s — source appears in directory
  6. sync-skills.ts runs weekly (cron):
     → Firecrawl scrapes each published source URL
     → Counts SKILL.md files found; writes skillCount delta to Sanity
     → Powers the "+N this week" badge on each card

  SCRIPTS REFERENCE:
  ──────────────────
  ┌─────────────────────────────────┬────────────────────────────────────┬──────────────────────────────────────┐
  │ Script                          │ Purpose                            │ Tokens required                      │
  ├─────────────────────────────────┼────────────────────────────────────┼──────────────────────────────────────┤
  │ scripts/seed-sanity.ts          │ One-time: seed authors/categories  │ SANITY_WRITE_TOKEN                   │
  │ scripts/sync-skill-             │ Notion Submissions (Approved) →    │ NOTION_API_TOKEN,                    │
  │   submissions.ts                │ Sanity skillSource (pending-review)│ NOTION_SUBMISSIONS_DB_ID,            │
  │                                 │                                    │ SANITY_WRITE_TOKEN                   │
  │ scripts/sync-skills.ts          │ Firecrawl crawl → update           │ SANITY_API_TOKEN,                    │
  │                                 │ skillCount delta on Sanity docs    │ SANITY_WRITE_TOKEN,                  │
  │                                 │                                    │ FIRECRAWL_API_KEY (new)              │
  └─────────────────────────────────┴────────────────────────────────────┴──────────────────────────────────────┘

  SCHEMA ENFORCEMENT LAYERS:
  ───────────────────────────
  Layer 1 — Notion: Article template checklist gates quality
            before a page can be set to "Published"
  Layer 2 — Sync script: validates required fields exist;
            skips malformed pages, logs warnings
  Layer 3 — Sanity: schema validation (required() rules)
            rejects documents missing title, slug, or body


══════════════════════════════════════════════════════════════════
  ENV VAR STATUS
══════════════════════════════════════════════════════════════════

  Variable                   Local (.env.local)   Vercel
  ─────────────────────────  ──────────────────   ──────
  NOTION_API_TOKEN           ✅ set               add →
  NOTION_DB_ID               ✅ set               add →
  SUBMISSIONS_DB_ID          ✅ set               add →
  NEXT_PUBLIC_SANITY_        ✅ set               add →
    PROJECT_ID
  NEXT_PUBLIC_SANITY_        ✅ set               add →
    DATASET
  SANITY_API_TOKEN           ✅ set               add →
  SANITY_WRITE_TOKEN         ✅ set               add →
  SYNC_SECRET                ✅ set               add →
  GITHUB_TOKEN               ⏳ optional          add →
  FIRECRAWL_API_KEY          ⏳ pending           add →
  BEEHIIV_API_KEY            ⏳ pending           —
  BEEHIIV_PUBLICATION_ID     ⏳ pending           —

  ACTION REQUIRED: Copy all ✅ vars to Vercel →
  Project Settings → Environment Variables → Production
```
