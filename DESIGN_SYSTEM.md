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

| Token | Value | Usage |
| --- | --- | --- |
| `--bg` | `#1e1e1e` | Page background |
| `--bg2` | `#252525` | Elevated surfaces (cards, sidebar, topbar) |
| `--bg3` | `#2d2d2d` | Code blocks, deep surface |
| `--border` | `#3a3a3a` | All borders and dividers |
| `--border-soft` | `#323232` | Subtle separators |
| `--amber` | `#c8861a` | Primary accent — CTAs, links, highlights, logo mark |
| `--amber-dim` | `#8a5c10` | Secondary amber — icon borders |
| `--amber-glow` | `rgba(200,134,26,0.09)` | Background tint on amber-accented elements |
| `--text` | `#b0b0b0` | Body copy, default text |
| `--text-dim` | `#707070` | Metadata, labels, muted UI text |
| `--text-bright` | `#e8e8e8` | Headlines, active elements, key copy |

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

| Element | Font | Size | Weight | Notes |
| --- | --- | --- | --- | --- |
| Hero title | Bebas Neue | `clamp(64px, 8vw, 108px)` | 400 | `line-height: 0.92`, `letter-spacing: 0.02em` |
| Article title (page) | Bebas Neue | `clamp(40px, 5vw, 64px)` | 400 | `line-height: 0.95` |
| Section title | Bebas Neue | `32px` | 400 | `letter-spacing: 0.06em` |
| Article title XL (index featured) | Bebas Neue | `32px` | 400 | `line-height: 1.0` |
| Article title LG (grid card) | Bebas Neue | `24px` | 400 | `line-height: 1.0` |
| Mission block | Bebas Neue | `clamp(28px, 3.5vw, 46px)` | 400 | |
| Body copy | IBM Plex Sans | `16px` | 300 | `line-height: 1.85` |
| UI body | IBM Plex Sans | `15px` | 400 | `line-height: 1.7` |
| Small body | IBM Plex Sans | `13px` | 300 | `line-height: 1.7` |
| Nav links | IBM Plex Mono | `11px` | 400 | Uppercase, `letter-spacing: 0.08em` |
| Tags / categories | IBM Plex Mono | `9–11px` | 400 | Uppercase, `letter-spacing: 0.1–0.14em` |
| Metadata | IBM Plex Mono | `9–10px` | 400 | Uppercase, muted |

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
- Title: Bebas Neue (size varies by card size)
- Excerpt: IBM Plex Sans 13px, 300 weight, `var(--text)`
- Meta: IBM Plex Mono, 9px, uppercase, `var(--text-dim)` with 3px dot separators

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
