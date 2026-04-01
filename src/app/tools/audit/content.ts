/**
 * Static copy: dimension tooltips, article cross-links, recommendation templates.
 */

import { SITE_BASE, type Tier } from "./config";
import type { ScoreResult, WorkflowInput } from "./scoring";

// -- Dimension tooltips -------------------------------------------------------
export const TOOLTIPS = {
  time_cost:
    "How many hours per week does a person spend on this workflow? Include setup time, execution, error correction, and any downstream work triggered by this task.",
  error_rate:
    "How often does this workflow produce mistakes — missed steps, wrong data, incorrect outputs — that require correction?",
  dependency_risk:
    "How many people know how to run this workflow correctly? Single-person dependency is a business risk.",
  data_quality:
    "What is the quality of the data flowing into this workflow? Automation amplifies data quality — good inputs produce reliable outputs.",
  judgment_pct:
    "What percentage requires human judgment versus following a fixed set of rules? Fully rule-based workflows are ideal for automation.",
};

// -- Article cross-links ------------------------------------------------------
interface Article {
  title: string;
  url: string;
  desc: string;
}

const ARTICLES: Record<string, Article> = {
  hub: {
    title: "Best Automation Tools for Small Businesses in 2026",
    url: `${SITE_BASE}/articles/best-automation-tools-small-businesses-2026`,
    desc: "The complete guide to automation tools — category breakdowns, real stack recommendations.",
  },
  audit: {
    title: "What a Good Automation Audit Should Actually Include",
    url: `${SITE_BASE}/articles/automation-audit-workflow-checklist`,
    desc: "The five-dimension framework behind this tool, explained in full.",
  },
  n8n: {
    title: "n8n vs Make vs Zapier: Which to Choose",
    url: `${SITE_BASE}/articles/n8n-vs-make-vs-zapier-workflow-automation-2026`,
    desc: "Side-by-side comparison with real pricing examples.",
  },
  cold_outreach: {
    title: "The Cold Outreach Automation Stack",
    url: `${SITE_BASE}/articles/cold-outreach-automation-stack-2026`,
    desc: "Apollo + Instantly + AI research — the full outbound stack.",
  },
  firecrawl: {
    title: "Firecrawl Tutorial: Build a Web Research Agent",
    url: `${SITE_BASE}/articles/firecrawl-tutorial-build-web-research-agent`,
    desc: "Extract structured data from any website to feed your automations.",
  },
  scaling: {
    title: "Best Automation Tools for Scaling Without Hiring",
    url: `${SITE_BASE}/articles/best-automation-tools-scaling-without-hiring-2026`,
    desc: "Replace admin work with automation before your first full-time hire.",
  },
  skills: {
    title: "Skills Hub — SKILL.md Directory",
    url: `${SITE_BASE}/skills`,
    desc: "The canonical directory of SKILL.md files for AI coding agents.",
  },
};

// -- Keyword -> article mapping -----------------------------------------------
const KEYWORD_ARTICLE_MAP: [string[], string[]][] = [
  [
    ["email", "newsletter", "outreach", "follow-up", "follow up", "prospect"],
    ["cold_outreach", "hub"],
  ],
  [
    ["crm", "sales", "lead", "pipeline", "deal", "client"],
    ["cold_outreach", "hub"],
  ],
  [
    ["content", "copy", "blog", "social", "post", "publish"],
    ["hub", "scaling"],
  ],
  [["data", "research", "scrape", "extract", "enrich"], ["firecrawl", "hub"]],
  [["report", "reporting", "dashboard", "analytics"], ["hub", "n8n"]],
  [["onboard", "onboarding", "setup", "kickoff"], ["scaling", "hub"]],
  [["invoice", "billing", "payment", "accounting"], ["hub", "n8n"]],
];

const FALLBACK_ARTICLES = ["hub", "audit", "n8n"];

export function getContextualLinks(
  workflows: Pick<WorkflowInput, "name" | "description">[]
): Article[] {
  const combined = workflows
    .map((w) => `${w.name} ${w.description}`.toLowerCase())
    .join(" ");

  const matched: string[] = [];
  for (const [keywords, articleKeys] of KEYWORD_ARTICLE_MAP) {
    if (keywords.some((kw) => combined.includes(kw))) {
      for (const k of articleKeys) {
        if (!matched.includes(k)) matched.push(k);
      }
    }
  }

  for (const k of FALLBACK_ARTICLES) {
    if (!matched.includes(k)) matched.push(k);
    if (matched.length >= 5) break;
  }

  return matched.slice(0, 5).map((k) => ARTICLES[k]);
}

// -- Recommendation templates -------------------------------------------------
export function getRecommendation(
  workflowName: string,
  result: ScoreResult,
  workflow: WorkflowInput
): string {
  const { tier } = result;
  const time = workflow.time_cost.toLowerCase();
  const error = workflow.error_rate.toLowerCase().split(" —")[0];

  switch (tier) {
    case "Automate Now":
      return `${workflowName} is your highest-priority automation target. It consumes ${time} and has ${error} error exposure. Start here — the ROI is immediate.`;
    case "Automate Soon":
      return `${workflowName} is a strong candidate. Address your top priority first, then build this one. The fundamentals are right — it just needs sequencing.`;
    case "Evaluate Further":
      return `${workflowName} has mixed signals. It may be worth automating, but run a one-week time audit first to confirm the actual hours involved before investing in a build.`;
    case "Do Not Automate":
      return `${workflowName} should stay human-led. The judgment requirement is too high — automation would reduce quality, not improve it.`;
    case "Conditional":
      return `${workflowName} cannot be reliably automated yet. The data quality is too inconsistent. Fix the upstream inputs first, then revisit.`;
    default:
      return `${workflowName} — review manually.`;
  }
}
