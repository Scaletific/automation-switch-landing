"""
Static copy: dimension tooltips, article cross-links, recommendation templates.
"""

from config import SITE_BASE

# ── Dimension tooltips (pulled from audit article framework) ───────────────
TOOLTIPS = {
    "time_cost": (
        "How many hours per week does a person spend on this workflow? "
        "Include setup time, execution, error correction, and any downstream "
        "work triggered by this task. Higher time cost = stronger automation case."
    ),
    "error_rate": (
        "How often does this workflow produce mistakes — missed steps, wrong data, "
        "incorrect outputs — that require correction? "
        "Critical errors include things like wrong invoices sent to clients or "
        "missed SLA-triggering events."
    ),
    "dependency_risk": (
        "How many people know how to run this workflow correctly? "
        "Single-person dependency is a business risk: if they leave or are unavailable, "
        "the process stops. High dependency = stronger case for documenting and automating."
    ),
    "data_quality": (
        "What is the quality of the data flowing into this workflow? "
        "Automation amplifies data quality — good inputs produce reliable outputs, "
        "poor inputs produce unreliable outputs at scale. "
        "If data is unstructured or inconsistent, fix that before automating."
    ),
    "judgment_pct": (
        "What percentage of this workflow requires human judgment — reading context, "
        "making exceptions, applying discretion — versus following a fixed set of rules? "
        "Fully rule-based workflows are ideal for automation. "
        "Judgment-heavy workflows should stay human-led."
    ),
}

# ── Article cross-links ────────────────────────────────────────────────────
ARTICLES = {
    "hub": {
        "title": "Best Automation Tools for Small Businesses in 2026",
        "url":   f"{SITE_BASE}/articles/best-automation-tools-small-businesses-2026",
        "desc":  "The complete guide to automation tools — category breakdowns, real stack recommendations.",
    },
    "audit": {
        "title": "What a Good Automation Audit Should Actually Include",
        "url":   f"{SITE_BASE}/articles/automation-audit-workflow-checklist",
        "desc":  "The five-dimension framework behind this tool, explained in full.",
    },
    "n8n": {
        "title": "n8n vs Make vs Zapier: Which to Choose",
        "url":   f"{SITE_BASE}/articles/n8n-vs-make-vs-zapier-workflow-automation-2026",
        "desc":  "Side-by-side comparison with real pricing examples at different workflow volumes.",
    },
    "cold_outreach": {
        "title": "The Cold Outreach Automation Stack",
        "url":   f"{SITE_BASE}/articles/cold-outreach-automation-stack-2026",
        "desc":  "Apollo + Instantly + AI research — the full outbound stack.",
    },
    "firecrawl": {
        "title": "Firecrawl Tutorial: Build a Web Research Agent",
        "url":   f"{SITE_BASE}/articles/firecrawl-tutorial-build-web-research-agent",
        "desc":  "Extract structured data from any website to feed your automations.",
    },
    "scaling": {
        "title": "Best Automation Tools for Scaling Without Hiring",
        "url":   f"{SITE_BASE}/articles/best-automation-tools-scaling-without-hiring-2026",
        "desc":  "Replace admin work with automation before your first full-time hire.",
    },
    "skills": {
        "title": "Skills Hub — SKILL.md Directory",
        "url":   f"{SITE_BASE}/skills",
        "desc":  "The canonical directory of SKILL.md files for AI coding agents.",
    },
}

# ── Keyword → article mapping (for P0-6 dynamic cross-links) ──────────────
KEYWORD_ARTICLE_MAP = [
    (["email", "newsletter", "outreach", "follow-up", "follow up", "prospect"],
     ["cold_outreach", "hub"]),
    (["crm", "sales", "lead", "pipeline", "deal", "client"],
     ["cold_outreach", "hub"]),
    (["content", "copy", "blog", "social", "post", "publish"],
     ["hub", "scaling"]),
    (["data", "research", "scrape", "extract", "enrich"],
     ["firecrawl", "hub"]),
    (["report", "reporting", "dashboard", "analytics"],
     ["hub", "n8n"]),
    (["onboard", "onboarding", "setup", "kickoff"],
     ["scaling", "hub"]),
    (["invoice", "billing", "payment", "accounting"],
     ["hub", "n8n"]),
]

FALLBACK_ARTICLES = ["hub", "audit", "n8n"]


def get_contextual_links(workflows: list[dict]) -> list[dict]:
    """
    Return 3-5 article objects based on keyword matching across workflow
    names and descriptions. Always includes the hub article.
    """
    combined_text = " ".join(
        (w.get("name", "") + " " + w.get("description", "")).lower()
        for w in workflows
    )

    matched_keys: list[str] = []
    for keywords, article_keys in KEYWORD_ARTICLE_MAP:
        if any(kw in combined_text for kw in keywords):
            for k in article_keys:
                if k not in matched_keys:
                    matched_keys.append(k)

    # Always include hub; pad with fallbacks to reach at least 3
    for k in FALLBACK_ARTICLES:
        if k not in matched_keys:
            matched_keys.append(k)
        if len(matched_keys) >= 5:
            break

    return [ARTICLES[k] for k in matched_keys[:5]]


# ── Recommendation templates ───────────────────────────────────────────────
def get_recommendation(workflow_name: str, result: dict, workflow: dict) -> str:
    tier = result["tier"]
    time = workflow.get("time_cost", "")
    error = workflow.get("error_rate", "")

    if tier == "Automate Now":
        return (
            f"**{workflow_name}** is your highest-priority automation target. "
            f"It consumes {time.lower()} and has {error.lower().split(' —')[0]} error exposure. "
            "Start here — the ROI is immediate."
        )
    if tier == "Automate Soon":
        return (
            f"**{workflow_name}** is a strong candidate. "
            "Address your top priority first, then build this one. "
            "The fundamentals are right — it just needs sequencing."
        )
    if tier == "Evaluate Further":
        return (
            f"**{workflow_name}** has mixed signals. "
            "It may be worth automating, but run a one-week time audit first "
            "to confirm the actual hours involved before investing in a build."
        )
    if tier == "Do Not Automate":
        return (
            f"**{workflow_name}** should stay human-led. "
            "The judgment requirement is too high — automation would reduce quality, "
            "not improve it. Focus automation effort elsewhere."
        )
    if tier == "Conditional":
        return (
            f"**{workflow_name}** cannot be reliably automated yet. "
            "The data quality is too inconsistent. Fix the upstream inputs first — "
            "standardise formats, eliminate manual entry where possible — "
            "then revisit."
        )
    return f"**{workflow_name}** — review manually."
