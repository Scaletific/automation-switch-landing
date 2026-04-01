# Automation Switch — Design System

> **For any agent picking this up:** This document is the single source of truth for the Automation Switch visual identity, component patterns, and technical decisions. Do not deviate from these rules without explicit instruction from the human. The static HTML prototypes in this repo are the reference implementation — read them alongside this doc.

---

## Brand Context

**What Automation Switch is:**
A content-first automation hub and tools platform. The goal is SEO-driven audience growth, a mailing list, and a clear pointer to tools (starting with PrecisionReach). It is the market-facing revenue wedge under the Scaletific umbrella.

**What it is not:**
A corporate brochure site, a SaaS product page, or a developer docs portal. It reads like a serious editorial publication that happens to build automation tools.

**Parent company:** Scaletific (enterprise, platform engineering, infrastructure)
**Primary tool:** PrecisionReach — AI cold email research + generation (`precisionreach.automationswitch.com`)

---

## Colour Palette

The site uses a **warm cream/parchment** light theme with dark inversion blocks and a single amber accent.

| Token | Value | Usage |
| --- | --- | --- |
| `--bg` | `#f0ebe0` | Page background (warm cream) |
| `--bg2` | `#f9f7f2` | Elevated surfaces, section bars, topbar |
| `--bg3` | `#e8e2d6` | Code blocks, deep surface, install blocks |
| `--bg-inv` | `#1e1a14` | Dark inversion blocks (newsletter, hero right, footer) |
| `--border` | `#c4bdb0` | All borders and dividers |
| `--border-soft` | `#d4cec6` | Subtle separators |
| `--border-strong` | `#9a9080` | Emphasis borders |
| `--amber` | `#c8861a` | Primary accent — CTAs, links, highlights, hover bars |
| `--amber-bright` | `#f9b700` | High-visibility amber — numbers in dark blocks, accent chips |
| `--amber-dark` | `#a06810` | Muted amber on light bg (eyebrows on callout sections) |
| `--amber-glow` | `rgba(200,134,26,0.10)` | Background tint on amber-accented elements |
| `--amber-light` | `rgba(200,134,26,0.10)` | Skills callout background |
| `--text` | `#1e1a14` | Body copy, default text — high contrast |
| `--text-mid` | `#4a4438` | Descriptions, secondary content — **minimum for readable prose** |
| `--text-dim` | `#857d72` | Metadata labels only — 3.4:1 contrast, WCAG AA fail at small sizes |
| `--text-bright` | `#1e1a14` | Headlines, active elements |
| `--text-inv` | `#f0ebe0` | Text on dark inversion blocks |
| `--text-inv-dim` | `#a09888` | Muted text on dark inversion blocks |

**Contrast rules (enforced after 2026-03-29 readability audit):**

- `--text-dim` **must not** be used for description text or body copy — only for decorative metadata labels
- All card descriptions, article excerpts, and tool descriptions use `--text-mid` minimum
- `--text` is preferred for any content the user needs to read to make a decision
- Footer links and nav items on dark background: `--text-inv-dim` is acceptable at 13px+

**Rule:** Never use pure white or pure black. Never introduce new accent colours. Amber is the only accent. If a second accent is ever needed, escalate to human first.

---

## Typography

All fonts are loaded from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet" />
```

| Token | Font | Usage |
| --- | --- | --- |
| `--display` | Bebas Neue | Hero headlines, section titles, large display type, article titles |
| `--sans` | IBM Plex Sans | Body copy, nav labels, descriptions, UI text |
| `--mono` | IBM Plex Mono | Metadata, tags, categories, buttons, labels, eyebrows, code |

### Type Scale

| Element | Font | Size | Weight | Color | Notes |
| --- | --- | --- | --- | --- | --- |
| Page title XL | Bebas Neue | `clamp(56px, 8vw, 96px)` | 400 | `--text-bright` | `line-height: 0.92` |
| Hero title | Bebas Neue | `clamp(40px, 5.5vw, 72px)` | 400 | `--text-bright` | `line-height: 0.95` |
| Section title / card name | Bebas Neue | `26–32px` | 400 | `--text-bright` | `letter-spacing: 0.03–0.06em` |
| Mission block | Bebas Neue | `clamp(28px, 3.5vw, 46px)` | 400 | `--text-bright` | amber `em` span for emphasis |
| Article body | IBM Plex Sans | `16px` | 400 | `--text` | `line-height: 1.85`, max-width ~680px |
| Card descriptions | IBM Plex Sans | `14–15px` | **400** | **`--text-mid`** | Never 300 weight or `--text-dim` |
| UI body / page sub | IBM Plex Sans | `14px` | 300–400 | `--text` | `line-height: 1.8` |
| Footer nav links | IBM Plex Mono | `13px` | 400 | `--text-inv-dim` | `letter-spacing: 0.04em` |
| Nav links (topbar) | IBM Plex Mono | `11px` | 400 | `--text-mid` | Uppercase, `letter-spacing: 0.08em` |
| Section bar labels | Bebas Neue | `18px` | 400 | `--text` | `letter-spacing: 0.22em` |
| Tags / platform chips | IBM Plex Mono | `10px` | 400 | **`--text-mid`** | Uppercase, never `--text-dim` |
| Metadata / article meta | IBM Plex Mono | `10px` | 400 | `--text-mid` | Uppercase |
| Eyebrows / micro labels | IBM Plex Mono | `10px` | 400–500 | `--amber` | Uppercase, `letter-spacing: 0.16–0.2em` |
| Footer col labels | IBM Plex Mono | `10px` | 400 | `--amber` | Uppercase |
| Footer bottom copy | IBM Plex Mono | `11px` | 400 | `--text-inv-dim` | |
| Badge / status chips | IBM Plex Mono | `9px` | 400 | varies | Uppercase |

**Readability floor (enforced 2026-03-29):** No content text below 14px. No description text at weight 300. No description text using `--text-dim`.

---

## Texture & Atmosphere

Every page has a **noise overlay** applied via `body::before`. This is non-negotiable — it is the primary texture element that elevates the design above flat dark UI.

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.5;
}
```

---

## Layout System

- **Max content width:** `1200px`, centred, `padding: 0 40px` (mobile: `0 20px`)
- **Section padding:** `64px 40px` standard, `120px 0` for major sections
- **Grid gaps:** `1px` between grid cells — the gap IS the border, using `background: var(--border)` on the grid container
- **No border-radius** on content cards or grid cells — sharp corners only. Border-radius only on form inputs and small buttons (max `2–4px`)

### Grid Patterns

**Featured article layout (homepage + index):**

```text
2fr | 1fr
     [side item]
     [side item]
```

**Standard article grid:** `repeat(3, 1fr)` with `gap: 1px`, `background: var(--border)`

**Tool cards:** `repeat(3, 1fr)` — same 1px gap pattern

**Article layout (single article):** `1fr 280px` — body + sticky sidebar

**Hero:** `1fr 360px` — content + email capture sidebar

---

## Component Patterns

### Topbar / Nav

- Height: `52px`, sticky, `z-index: 100`
- Background: `rgba(30,30,30,0.96)` + `backdrop-filter: blur(8px)`
- Logo: SVG mark + Bebas Neue wordmark (`AUTOMATION` + `SWITCH` in amber)
- Nav links: IBM Plex Mono, 11px, uppercase, muted → amber on hover
- Social icons: X, Instagram, LinkedIn, YouTube — `14px`, grouped with right border separator
- CTA button: `nav-cta` — amber background, white text, no border-radius

### Cards (Content)

- Background: `var(--bg)` → `var(--bg2)` on hover
- **Top amber bar on hover:** `::before` pseudo, `height: 2px`, `background: var(--amber)`, `scaleX(0→1)` on hover, `transform-origin: left`
- Category tag: IBM Plex Mono, 9px, uppercase, amber
- **Kicker** (optional): IBM Plex Mono, 10px, weight 500, uppercase, `letter-spacing: 0.18em`, `var(--amber-dark)` — shown above the headline, sets editorial angle. CSS class: `.article-kicker`
- Title: Bebas Neue (size varies by card size)
- Excerpt / description: IBM Plex Sans **14–15px, 400 weight, `var(--text-mid)`** — never use 300 weight or `--text-dim`
- Meta: IBM Plex Mono, 10px, uppercase, `var(--text-mid)`

### Featured Article Card (Asymmetric — Wired/Economist pattern)

The home page "Latest Articles" section uses an asymmetric lead layout instead of a uniform 3-col grid. This is architectural — do not revert to equal columns.

- **First article** renders as `.article-featured` — a full-width 2-col card:
  - Left panel (`.article-featured-text`): cream background, 48px padding, holds label/kicker/title/excerpt/meta
  - Right panel (`.article-featured-side`): dark inversion (`var(--bg-inv)`), large display category name
  - **Permanent amber bar** at top (`::before`, `height: 3px`) — always visible, not hover-only
- **Remaining articles** render in `.article-grid-2col` — a 2-col grid below the featured card

### Section Opening Rules (Economist/Bloomberg pattern)

Key structural sections use a thick amber top border to mark editorial divisions:

```css
/* Applied to .stat-band and .skills-callout */
border-top: 3px solid var(--amber);
```

This is a permanent rule — not hover state. Applies to `.stat-band` and `.skills-callout`. Do not apply to every section — reserved for primary structural breaks only.

### Article Body Width

```css
.article-body {
  max-width: 680px;   /* New Yorker / Economist pattern — optimal reading width */
  font-weight: 400;   /* Never 300 for body text */
}
```

The 680px cap is non-negotiable — do not increase it for "breathing room". Narrow column is the design intent.

### Buttons

```css
/* Primary CTA */
.btn-primary {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #fff;
  background: var(--amber);
  padding: 14px 28px;
  border: none;
  /* NO border-radius */
}

/* Ghost / secondary */
.btn-ghost {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
  /* no background, no border */
}
```

### Subscribe Form

- Input: `background: var(--bg2)`, 1px `var(--border)` border, amber border on focus
- Button: full-width amber, IBM Plex Mono uppercase
- Note text: IBM Plex Mono 9–10px, `var(--text-dim)`

### Ticker

- Scrolling marquee, `animation: ticker 28s linear infinite`
- Text: IBM Plex Mono, 10px, uppercase, `var(--text-dim)`
- Separators: `///` in amber

### Filter Bar (Articles Index)

- Filter buttons: IBM Plex Mono, 10px, uppercase, 1px border
- Active state: amber border + `var(--amber-glow)` background + amber text
- Search input: IBM Plex Mono, right-aligned, 200px wide

### Article Sidebar (Single Article)

- Sticky at `top: 72px`
- Table of contents: left border indicator, amber on active
- Subscribe form: same pattern as hero sidebar

### Pagination

- 36×36px buttons, 1px border, amber on active/hover
- IBM Plex Mono, 11px

### Section Labels

- IBM Plex Mono, 10px, uppercase, `var(--text-dim)`
- Optional `::after` line extending to fill width

---

## Animation Rules

All animations are CSS-only. No JS animation libraries.

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- Hero elements stagger in with `0.1s` delays per element
- Card hover transitions: `0.2s` ease
- Amber bar reveal on card: `0.3s` ease, `transform-origin: left`
- Ticker: `28s linear infinite`

---

## Page Templates

### 1. Homepage

Source: `_prototypes/automation-switch-grey.html`

Structure: `topbar → ticker → hero (2-col) → divider → featured articles → tools grid → articles list → mission block → footer`

### 2. Articles Index

Source: `_prototypes/automation-switch-articles-index.html`

Structure: `topbar → page header → filter bar → featured row → articles grid → pagination → footer`

### 3. Single Article

Source: `_prototypes/automation-switch-article.html`

Structure: `topbar → article header (breadcrumb + title + meta) → 2-col layout (body + sticky sidebar) → related articles → footer`

---

## Logo Mark

SVG — 28×28px. A stylised switch/toggle graphic:

```svg
<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="24" height="24" stroke="#e8a020" stroke-width="1.5"/>
  <rect x="7" y="7" width="6" height="14" fill="#e8a020"/>
  <rect x="15" y="7" width="6" height="7" fill="#3a3a3a"/>
  <rect x="15" y="16" width="6" height="5" fill="#e8a020" opacity="0.4"/>
</svg>
```

Wordmark: `AUTOMATION` (var(--text-bright)) + `SWITCH` (var(--amber)), Bebas Neue, 18px, `letter-spacing: 0.12em`

---

## Responsive Breakpoints

| Breakpoint | Changes |
| --- | --- |
| `max-width: 900px` | Hero → single column. Featured grid → single column. Tools grid → 2 col. Nav links hidden (keep social + CTA). Article sidebar → static |
| `max-width: 600px` | Padding reduced to 20px. Tools grid → 1 col. Article number column hidden in list. Footer → stacked column |

---

## Tech Stack (Locked)

| Layer | Technology |
| --- | --- |
| Frontend framework | Next.js 15 + TypeScript + Tailwind CSS 4 |
| CMS | **Sanity** (confirmed) |
| Newsletter / email | **Beehiiv** |
| Email capture | Beehiiv Publications API — POST to `/api/subscribe` route in Next.js |
| Deployment | Vercel — build from `web/` subdirectory |
| Domain | `automationswitch.com` (Vercel DNS) |

### Project Structure

```text
automationswitch/
├── _prototypes/          # Static HTML design references (read-only)
├── brand-assets/         # Logos, favicons, social banners
├── DESIGN_SYSTEM.md      # This file
└── web/                  # Next.js app — deploy root for Vercel
    ├── sanity/
    │   ├── sanity.config.ts
    │   ├── schemaTypes/  # article.ts, category.ts, tool.ts
    │   └── lib/          # client.ts, queries.ts
    └── src/
        ├── app/
        │   ├── page.tsx                    # Homepage
        │   ├── articles/page.tsx           # Articles index
        │   ├── articles/[slug]/page.tsx    # Single article
        │   ├── studio/[[...tool]]/page.tsx # Sanity Studio at /studio
        │   └── api/subscribe/route.ts      # Beehiiv API proxy
        └── components/
            ├── layout/   # Topbar, Footer
            ├── home/     # Ticker, ToolCard
            ├── articles/ # ArticleCard, FeaturedArticle
            └── ui/       # SubscribeForm, LogoMark, SocialLinks
```

### Vercel Configuration

Set **Root Directory** to `web` in Vercel project settings.

### Sanity Setup (one-time, human task)

1. Create a Sanity project at sanity.io
2. Add `.env.local` in `web/` with the following vars:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_read_token
BEEHIIV_API_KEY=your_key
BEEHIIV_PUBLICATION_ID=your_publication_id
```

3. Add the same vars to Vercel environment settings.
4. Run `npm install && npm run dev` from `web/`.
5. Visit `localhost:3000/studio` to access the CMS.

### Sanity Schemas

- **Article**: title, slug, category (ref), excerpt, body (Portable Text), publishedAt, readTime, featured (bool), seo (metaTitle, metaDescription)
- **Category**: title, slug
- **Tool**: name, slug, tagline, description, icon (emoji), url, status (live/beta/soon), order

### Beehiiv Subscribe Endpoint

```typescript
// pages/api/subscribe.ts (or app/api/subscribe/route.ts)
await fetch(`https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email,
    reactivate_existing: true,
    send_welcome_email: true
  })
})
```

The provider is abstracted behind `/api/subscribe`. The frontend never calls Beehiiv directly. This means Beehiiv can be swapped for Loops, ConvertKit, or Resend without touching any frontend code.

---

## SEO Principles

- Content-first — articles are the primary SEO surface
- Each article page needs: `<title>`, `<meta name="description">`, Open Graph tags, canonical URL
- Article categories map to URL slugs: `/articles/deep-dive/`, `/articles/tool-guide/`, etc.
- PrecisionReach is cross-linked from article content naturally (see: "Why Most Automation Projects Stall at Step Three" already references it)
- No keyword stuffing — topical authority through genuine automation content

---

## Hero & OG Image Standards

> **Full specification:** See `HERO_IMAGE_GUIDELINES.md` at the repo root for per-content-type treatments, annotation style, screenshot capture SOP, and Wave 1 screenshot assignments.

**Core rule:** Screenshots from actual tool usage — never AI-generated art, stock photos, or marketing screenshots from tool websites. This is an E-E-A-T signal.

| Spec | Value |
|---|---|
| Aspect ratio | 16:9, 1200 × 675px minimum |
| Capture | 2× resolution, 1440px browser width |
| Theme | Dark mode preferred |
| Export | WebP primary, JPEG fallback, under 150KB |
| Chrome | No browser chrome — tool UI only |
| Annotations | Amber `#c8861a` rectangles/arrows, IBM Plex Mono labels, max 2–3 |
| Alt text | `[Tool Name] [what's shown] — [context]` |

**Per content type:**

| Content Type | Hero Treatment |
|---|---|
| **Tool Comparison** | Split-screen composite: 2–3 tool UIs, amber divider |
| **Deep Dive** | Single annotated screenshot, 1–2 amber callouts |
| **Workflow / How-To** | Process screenshot showing completed workflow |
| **Strategy / Framework** | Dashboard or results screenshot |
| **Audit / Assessment** | Before/after composite with amber divider |

**OG image derivation:** Hero image IS the OG image. Sanity serves at `?w=1200&h=675&fit=crop`. No separate asset needed. `hotspot: true` enabled in schema for focal point control.

### SEO checklist (append to article review)

- Hero image present with descriptive alt text (not article title)
- Hero follows content-type treatment from guidelines
- Image under 150KB, exported as WebP
- OG image tag resolves to hero URL
- No AI art, stock photos, or vendor marketing screenshots

---

## Tools Section

PrecisionReach is the first live tool. Tool cards use the following status pattern:

```html
<!-- Live -->
<span class="tool-status live">
  <span class="status-dot"></span> Live
</span>

<!-- Coming soon -->
<span class="tool-status soon">
  <span class="status-dot"></span> Coming Soon
</span>
```

`live` status dot: `#5dba8a` with pulse animation. `soon`: `var(--text-dim)`, static.

PrecisionReach CTA links to: `https://precisionreach.automationswitch.com`

---

## What Not To Do

- Do not introduce new fonts
- Do not use border-radius on cards or grid cells
- Do not use pure white (`#ffffff`) anywhere
- Do not add new accent colours — amber is the only accent
- Do not use purple, blue, or any gradient as a primary design element
- Do not make the subscribe form the hero's primary visual focus — it supports the content, not the other way around
- Do not use placeholder stats that signal the site is unfinished ("12 articles planned")
- Do not break the 1px gap grid pattern with larger gaps or traditional borders on grid cells
