"""
Scoring weights, input options, priority tiers, and brand constants.
All magic numbers live here — change thresholds and weights without touching logic.
"""

# ── Scoring weights (must sum to 1.0) ──────────────────────────────────────
WEIGHTS = {
    "time_cost":       0.30,
    "error_rate":      0.25,
    "judgment_inverse": 0.25,
    "dependency_risk": 0.20,
}

# ── Input options → normalised 0-100 scores ────────────────────────────────
TIME_COST_OPTIONS = {
    "Less than 1 hr/week":  5,
    "1–2 hrs/week":        20,
    "2–5 hrs/week":        40,
    "5–10 hrs/week":       60,
    "10–20 hrs/week":      80,
    "20+ hrs/week":       100,
}

ERROR_RATE_OPTIONS = {
    "Low — rarely makes errors":                        0,
    "Medium — occasional mistakes needing fixes":      33,
    "High — frequent errors causing rework":           67,
    "Critical — errors have significant business impact": 100,
}

DEPENDENCY_RISK_OPTIONS = {
    "Low — anyone on the team can do it":           0,
    "Medium — 2–3 people know how":                50,
    "High — only one person knows how to do it":  100,
}

DATA_QUALITY_OPTIONS = {
    "High — structured digital data":                         100,
    "Medium — mostly structured, some manual entry":           67,
    "Low — mix of formats, some inconsistent":                 33,
    "Poor — unstructured, manual, inconsistent":               0,
}

# ── Priority tiers ─────────────────────────────────────────────────────────
TIER_AUTOMATE_NOW    = "Automate Now"
TIER_AUTOMATE_SOON   = "Automate Soon"
TIER_EVALUATE        = "Evaluate Further"
TIER_LOW_PRIORITY    = "Low Priority"
TIER_DO_NOT_AUTOMATE = "Do Not Automate"
TIER_CONDITIONAL     = "Conditional"

TIER_CONFIG = {
    TIER_AUTOMATE_NOW:    {"min": 75, "color": "#22c55e", "hex_bg": "#14532d", "icon": "🟢", "label": "Automate Now"},
    TIER_AUTOMATE_SOON:   {"min": 50, "color": "#3b82f6", "hex_bg": "#1e3a5f", "icon": "🔵", "label": "Automate Soon"},
    TIER_EVALUATE:        {"min": 25, "color": "#eab308", "hex_bg": "#422006", "icon": "🟡", "label": "Evaluate Further"},
    TIER_LOW_PRIORITY:    {"min":  0, "color": "#6b7280", "hex_bg": "#1f2937", "icon": "⚪", "label": "Low Priority"},
    TIER_DO_NOT_AUTOMATE: {"min": -1, "color": "#ef4444", "hex_bg": "#450a0a", "icon": "🔴", "label": "Do Not Automate"},
    TIER_CONDITIONAL:     {"min": -1, "color": "#f97316", "hex_bg": "#431407", "icon": "🟠", "label": "Conditional"},
}

# Judgment % threshold — above this, flag as "Do Not Automate"
JUDGMENT_OVERRIDE_THRESHOLD = 70

# ── Brand colours ──────────────────────────────────────────────────────────
BRAND = {
    "amber":        "#c8861a",
    "amber_bright": "#e09a20",
    "amber_dark":   "#a06810",
    "bg":           "#111113",
    "bg2":          "#18181d",
    "bg3":          "#1e1e23",
    "text":         "#c0c0c8",
    "text_bright":  "#f0f0f5",
    "text_dim":     "#666666",
    "border":       "#26262e",
}

# ── Max workflows per session ───────────────────────────────────────────────
MAX_WORKFLOWS = 5

# ── Site base URL (for cross-links) ────────────────────────────────────────
SITE_BASE = "https://automationswitch.com"
