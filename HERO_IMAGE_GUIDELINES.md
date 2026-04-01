# Automation Switch — Hero Image Guidelines

> **For any agent or contributor:** This document defines the hero image standards for all content on Automation Switch. It ensures visual consistency, SEO compliance, and E-E-A-T alignment across every article type. Follow these rules exactly.

---

## Core Principle

**Screenshots from actual tool usage — not AI-generated art, not stock photos.** Every hero image demonstrates that we use the tools we write about. This is an E-E-A-T signal: it says "we built with this, we tested this."

---

## Universal Rules (All Content Types)

### Format & Dimensions
- **Source:** Real screenshots from actual tool usage
- **Aspect ratio:** 16:9
- **Minimum resolution:** 1200 × 675px (OG image standard)
- **Capture resolution:** 2× (Retina) at 1440px browser width for consistent proportions
- **Export format:** WebP primary, JPEG fallback
- **Target file size:** Under 150KB
- **No browser chrome:** Crop out URL bar, tabs, and OS window controls — show the tool's UI only

### Theme & Colour Treatment
- **Dark mode screenshots preferred.** The site uses a warm cream theme, but dark tool UIs create a natural focal point within the page. They stand out against the `--bg` (#f0ebe0) background.
- If the tool has no dark mode: apply a subtle dark vignette overlay at the edges (20% opacity `#1e1a14`) to reduce jarring contrast with page background.
- **Never colour-correct screenshots** to match the site palette — authenticity matters more than brand matching.

### Annotation Style (When Needed)
- **Callout rectangles:** 2px stroke, `#c8861a` (amber)
- **Arrow pointers:** Amber, 2px stroke, simple straight arrows
- **Label text:** IBM Plex Mono, 11px, uppercase, white on semi-transparent dark background (`rgba(30, 26, 20, 0.85)`, 4px padding)
- **Max annotations per image:** 2–3. More than that = too busy.
- **Never use:** Red circles, freehand arrows, emoji callouts, or Comic Sans

### Alt Text Pattern
All hero images must have descriptive, SEO-useful alt text following this pattern:

```
[Tool Name] [what's shown] — [context for the article]
```

**Examples:**
- `"Airtable automation builder showing a Slack notification trigger connected to a filter step — workflow automation comparison"`
- `"Supabase SQL editor with row-level security policy highlighted — backend comparison for AI app builders"`
- `"Side-by-side view of Lovable and Bolt generating the same React component — AI code generation platform comparison"`

### Technical Delivery
- Upload to Sanity media library with structured alt text
- Sanity image pipeline serves at correct dimensions: `?w=1200&h=675&fit=crop`
- Hero image doubles as OG image — no separate OG asset needed
- `hotspot: true` is enabled in the Sanity schema for focal point control

---

## Content Type — Specific Guidelines

### Tool Comparison Articles

**Treatment:** Split-screen composite — 2–3 tool UIs side by side

| Element | Specification |
|---|---|
| Layout | Tools placed side by side, separated by a 2px amber vertical divider |
| Screen selection | Each tool must show the **equivalent screen** (e.g., all showing automation builders, or all showing dashboards) |
| Tool count | 2–3 tools per composite. For 4+ tool comparisons, pick the top 2–3 contenders |
| Labels | Optional — tool name in IBM Plex Mono at bottom of each panel if the UI isn't self-explanatory |

**Examples:**
- Airtable vs Notion: Airtable automation panel | divider | Notion automation panel
- Lovable vs Bolt vs v0: Lovable editor | divider | Bolt editor (v0 optional if space allows)
- Flowise vs Langflow vs Dify vs n8n: Pick Flowise + n8n as the two anchor tools

**Why this works:** The split-screen immediately signals "comparison" before the reader scrolls a single line. It also shows we have both tools open.

---

### Deep Dive / Single Tool Articles

**Treatment:** Single annotated screenshot — the tool's most relevant screen with 1–2 amber callouts

| Element | Specification |
|---|---|
| Screen selection | The feature the article focuses on — not the tool's homepage or marketing page |
| Annotations | 1–2 amber callout rectangles pointing to the specific feature discussed |
| Labels | Brief label text explaining what the callout highlights |

**Examples:**
- Supabase deep dive: SQL editor with amber callout on the RLS policy toggle
- Retool deep dive: Query builder with callout on the API connector panel

---

### Workflow / How-To Articles

**Treatment:** Process screenshot — the workflow in action, preferably a canvas or flow view

| Element | Specification |
|---|---|
| Screen selection | Show the completed workflow, not an empty canvas. The reader should see the "result" |
| Preference | Canvas/flow/DAG views over form-based UIs — they're more visually interesting |
| Annotations | Only if needed to highlight a specific step. Usually the workflow visual speaks for itself |

**Examples:**
- Flowise article: Complete RAG pipeline canvas with nodes connected
- n8n workflow guide: Multi-step automation flow with Slack + Airtable nodes

---

### Strategy / Framework Articles (e.g., Voice AI)

**Treatment:** Dashboard or results screenshot — show outcomes, not setup

| Element | Specification |
|---|---|
| Screen selection | Analytics dashboard, performance chart, call logs, or completed deployment view |
| Focus | Results-oriented imagery — positions the article as outcome-driven |
| Fallback | If no dashboard exists, use the tool's main interface at a state that implies "this is running in production" |

**Examples:**
- Voice AI agents: Call analytics dashboard showing completion rates and duration
- Automation ROI: Before/after metrics comparison

---

### Audit / Assessment Articles

**Treatment:** Before/after or diagnostic view

| Element | Specification |
|---|---|
| Layout | Composite: "before" state on left, "after" on right, separated by amber divider |
| Screen selection | Show the mess and the fix. The contrast is the value proposition |
| Fallback | Single diagnostic screenshot with amber callouts on the issues found |

**Examples:**
- Workflow audit: Messy Airtable base (left) → restructured version (right)
- SEO audit: Search Console showing errors → after remediation

---

## Screenshot Capture Process (Content SOP)

1. Set the tool to dark mode if available
2. Open browser at **1440px width** for consistent proportions
3. Capture at **2× resolution** (Retina display or browser DevTools device pixel ratio)
4. Crop to **16:9** aspect ratio, removing all browser chrome
5. For composites: combine screenshots in Figma or a processing script with 2px amber `#c8861a` vertical divider
6. Apply any annotations using the annotation style spec above
7. Export as **WebP** (primary) with JPEG fallback
8. Target file size: **under 150KB**
9. Upload to **Sanity media library** with structured alt text
10. Set **hotspot focal point** in Sanity for responsive cropping

---

## Screenshot Assignments — Wave 1 Articles

| Article | Screenshot Owner | Screens Needed |
|---|---|---|
| Airtable vs Notion | Mike / Anthony | Airtable automation flow panel, Notion automation panel |
| Lovable vs Bolt vs v0 | Anthony | Lovable editor (dream journal app), Bolt editor (same prompt) |
| Supabase vs Firebase | Mike | Supabase SQL editor, PrecisionReach table (redacted) |
| Retool vs Appsmith vs ToolJet | TBD (needs hands-on) | Retool query builder, Appsmith dashboard |
| Voice AI Agents | TBD (needs eval) | Platform call analytics or configuration screen |
| Flowise vs Langflow vs Dify vs n8n | TBD (needs hands-on) | Flowise canvas, n8n workflow |

---

## What NOT To Do

- Do not use AI-generated hero images (Midjourney, DALL-E, etc.) — they undermine E-E-A-T
- Do not use stock photography — it signals "we didn't actually use this"
- Do not use marketing screenshots from the tool's website — capture your own
- Do not include browser chrome, bookmarks bar, or personal tabs
- Do not use light-mode screenshots if dark mode is available
- Do not add more than 3 annotations — keep it clean
- Do not use different annotation styles across articles — amber only, per spec above
