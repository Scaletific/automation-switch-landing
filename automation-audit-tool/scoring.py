"""
Core scoring engine. All business logic lives here — no Streamlit imports.
"""

from config import (
    WEIGHTS,
    TIME_COST_OPTIONS,
    ERROR_RATE_OPTIONS,
    DEPENDENCY_RISK_OPTIONS,
    TIER_CONFIG,
    TIER_AUTOMATE_NOW,
    TIER_AUTOMATE_SOON,
    TIER_EVALUATE,
    TIER_LOW_PRIORITY,
    TIER_DO_NOT_AUTOMATE,
    TIER_CONDITIONAL,
    JUDGMENT_OVERRIDE_THRESHOLD,
)


def normalize_time(label: str) -> float:
    return float(TIME_COST_OPTIONS.get(label, 0))


def normalize_error(label: str) -> float:
    return float(ERROR_RATE_OPTIONS.get(label, 0))


def normalize_dependency(label: str) -> float:
    return float(DEPENDENCY_RISK_OPTIONS.get(label, 0))


def score_to_tier(score: float) -> str:
    for tier in [TIER_AUTOMATE_NOW, TIER_AUTOMATE_SOON, TIER_EVALUATE, TIER_LOW_PRIORITY]:
        if score >= TIER_CONFIG[tier]["min"]:
            return tier
    return TIER_LOW_PRIORITY


def calculate_priority_score(workflow: dict) -> dict:
    """
    workflow keys:
      name, description, time_cost, error_rate,
      dependency_risk, data_quality, judgment_pct
    Returns:
      score (float 0-100), tier (str), flag (str|None), breakdown (dict)
    """
    time_score       = normalize_time(workflow["time_cost"])
    error_score      = normalize_error(workflow["error_rate"])
    judgment_pct     = float(workflow["judgment_pct"])
    judgment_inverse = 100.0 - judgment_pct
    dep_score        = normalize_dependency(workflow["dependency_risk"])

    base_score = (
        time_score       * WEIGHTS["time_cost"] +
        error_score      * WEIGHTS["error_rate"] +
        judgment_inverse * WEIGHTS["judgment_inverse"] +
        dep_score        * WEIGHTS["dependency_risk"]
    )
    base_score = round(base_score, 1)

    breakdown = {
        "time_score":        time_score,
        "error_score":       error_score,
        "judgment_inverse":  judgment_inverse,
        "dependency_score":  dep_score,
    }

    # Data quality flag overrides tier (but not score)
    if workflow["data_quality"].startswith("Poor"):
        return {
            "score":     base_score,
            "tier":      TIER_CONDITIONAL,
            "flag":      "Fix data quality first — automate once inputs are structured",
            "breakdown": breakdown,
        }

    # Judgment override
    if judgment_pct > JUDGMENT_OVERRIDE_THRESHOLD:
        return {
            "score":     base_score,
            "tier":      TIER_DO_NOT_AUTOMATE,
            "flag":      "Human judgment is the value — automation would degrade quality",
            "breakdown": breakdown,
        }

    return {
        "score":     base_score,
        "tier":      score_to_tier(base_score),
        "flag":      None,
        "breakdown": breakdown,
    }


def calculate_overall_readiness(scored_workflows: list[dict]) -> dict:
    """
    Aggregate score across all workflows. Excludes Do Not Automate and
    Conditional workflows from the average (they don't represent actionable
    automation potential).
    """
    actionable = [
        w for w in scored_workflows
        if w["result"]["tier"] not in (TIER_DO_NOT_AUTOMATE, TIER_CONDITIONAL)
    ]

    if not actionable:
        avg = 0.0
    else:
        avg = sum(w["result"]["score"] for w in actionable) / len(actionable)

    counts = {tier: 0 for tier in TIER_CONFIG}
    for w in scored_workflows:
        tier = w["result"]["tier"]
        counts[tier] = counts.get(tier, 0) + 1

    return {
        "overall_score":   round(avg, 1),
        "tier_counts":     counts,
        "automate_now":    counts.get(TIER_AUTOMATE_NOW, 0),
        "do_not_automate": counts.get(TIER_DO_NOT_AUTOMATE, 0),
        "conditional":     counts.get(TIER_CONDITIONAL, 0),
        "actionable_count": len(actionable),
        "total_count":      len(scored_workflows),
    }


def rank_workflows(scored_workflows: list[dict]) -> list[dict]:
    """Sort workflows by score descending, with special tiers last."""
    special = [TIER_DO_NOT_AUTOMATE, TIER_CONDITIONAL]
    actionable = [w for w in scored_workflows if w["result"]["tier"] not in special]
    non_actionable = [w for w in scored_workflows if w["result"]["tier"] in special]
    actionable.sort(key=lambda w: w["result"]["score"], reverse=True)
    return actionable + non_actionable


def estimated_hours_saved(scored_workflows: list[dict]) -> float:
    """
    Estimate monthly hours recoverable from Automate Now + Automate Soon workflows.
    Uses midpoint of time cost range * 4 weeks.
    """
    from config import TIME_COST_OPTIONS
    MIDPOINTS = {
        "Less than 1 hr/week":  0.5,
        "1–2 hrs/week":         1.5,
        "2–5 hrs/week":         3.5,
        "5–10 hrs/week":        7.5,
        "10–20 hrs/week":      15.0,
        "20+ hrs/week":        25.0,
    }
    actionable_tiers = {TIER_AUTOMATE_NOW, TIER_AUTOMATE_SOON}
    total = 0.0
    for w in scored_workflows:
        if w["result"]["tier"] in actionable_tiers:
            hrs_week = MIDPOINTS.get(w["time_cost"], 0)
            total += hrs_week * 4  # weekly → monthly
    return round(total, 1)
