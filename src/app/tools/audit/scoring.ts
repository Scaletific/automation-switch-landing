/**
 * Core scoring engine. All business logic — no React imports.
 */

import {
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
  type Tier,
} from "./config";

// -- Types -------------------------------------------------------------------

export interface WorkflowInput {
  name: string;
  description: string;
  time_cost: string;
  error_rate: string;
  dependency_risk: string;
  data_quality: string;
  judgment_pct: number;
}

export interface ScoreBreakdown {
  time_score: number;
  error_score: number;
  judgment_inverse: number;
  dependency_score: number;
}

export interface ScoreResult {
  score: number;
  tier: Tier;
  flag: string | null;
  breakdown: ScoreBreakdown;
}

export interface ScoredWorkflow extends WorkflowInput {
  result: ScoreResult;
}

export interface OverallReadiness {
  overall_score: number;
  tier_counts: Record<Tier, number>;
  automate_now: number;
  do_not_automate: number;
  conditional: number;
  actionable_count: number;
  total_count: number;
}

// -- Normalizers -------------------------------------------------------------

function normalizeTime(label: string): number {
  return TIME_COST_OPTIONS[label] ?? 0;
}

function normalizeError(label: string): number {
  return ERROR_RATE_OPTIONS[label] ?? 0;
}

function normalizeDependency(label: string): number {
  return DEPENDENCY_RISK_OPTIONS[label] ?? 0;
}

function scoreToTier(score: number): Tier {
  for (const tier of [
    TIER_AUTOMATE_NOW,
    TIER_AUTOMATE_SOON,
    TIER_EVALUATE,
    TIER_LOW_PRIORITY,
  ] as const) {
    if (score >= TIER_CONFIG[tier].min) return tier;
  }
  return TIER_LOW_PRIORITY;
}

// -- Core scoring -----------------------------------------------------------

export function calculatePriorityScore(
  workflow: Pick<
    WorkflowInput,
    "time_cost" | "error_rate" | "dependency_risk" | "data_quality" | "judgment_pct"
  >
): ScoreResult {
  const time_score = normalizeTime(workflow.time_cost);
  const error_score = normalizeError(workflow.error_rate);
  const judgment_inverse = 100.0 - workflow.judgment_pct;
  const dep_score = normalizeDependency(workflow.dependency_risk);

  const base_score = Math.round(
    (time_score * WEIGHTS.time_cost +
      error_score * WEIGHTS.error_rate +
      judgment_inverse * WEIGHTS.judgment_inverse +
      dep_score * WEIGHTS.dependency_risk) *
      10
  ) / 10;

  const breakdown: ScoreBreakdown = {
    time_score,
    error_score,
    judgment_inverse,
    dependency_score: dep_score,
  };

  // Data quality flag overrides tier (but not score)
  if (workflow.data_quality.startsWith("Poor")) {
    return {
      score: base_score,
      tier: TIER_CONDITIONAL,
      flag: "Fix data quality first — automate once inputs are structured",
      breakdown,
    };
  }

  // Judgment override
  if (workflow.judgment_pct > JUDGMENT_OVERRIDE_THRESHOLD) {
    return {
      score: base_score,
      tier: TIER_DO_NOT_AUTOMATE,
      flag: "Human judgment is the value — automation would degrade quality",
      breakdown,
    };
  }

  return {
    score: base_score,
    tier: scoreToTier(base_score),
    flag: null,
    breakdown,
  };
}

// -- Aggregates -------------------------------------------------------------

export function calculateOverallReadiness(
  scored: ScoredWorkflow[]
): OverallReadiness {
  const actionable = scored.filter(
    (w) =>
      w.result.tier !== TIER_DO_NOT_AUTOMATE &&
      w.result.tier !== TIER_CONDITIONAL
  );

  const avg =
    actionable.length === 0
      ? 0
      : actionable.reduce((sum, w) => sum + w.result.score, 0) /
        actionable.length;

  const tier_counts = Object.fromEntries(
    Object.keys(TIER_CONFIG).map((t) => [t, 0])
  ) as Record<Tier, number>;

  for (const w of scored) {
    tier_counts[w.result.tier] = (tier_counts[w.result.tier] || 0) + 1;
  }

  return {
    overall_score: Math.round(avg * 10) / 10,
    tier_counts,
    automate_now: tier_counts[TIER_AUTOMATE_NOW] || 0,
    do_not_automate: tier_counts[TIER_DO_NOT_AUTOMATE] || 0,
    conditional: tier_counts[TIER_CONDITIONAL] || 0,
    actionable_count: actionable.length,
    total_count: scored.length,
  };
}

export function rankWorkflows(scored: ScoredWorkflow[]): ScoredWorkflow[] {
  const special = [TIER_DO_NOT_AUTOMATE, TIER_CONDITIONAL] as Tier[];
  const actionable = scored.filter((w) => !special.includes(w.result.tier));
  const nonActionable = scored.filter((w) => special.includes(w.result.tier));
  actionable.sort((a, b) => b.result.score - a.result.score);
  return [...actionable, ...nonActionable];
}

const TIME_MIDPOINTS: Record<string, number> = {
  "Less than 1 hr/week": 0.5,
  "1–2 hrs/week": 1.5,
  "2–5 hrs/week": 3.5,
  "5–10 hrs/week": 7.5,
  "10–20 hrs/week": 15.0,
  "20+ hrs/week": 25.0,
};

export function estimatedHoursSaved(scored: ScoredWorkflow[]): number {
  const actionableTiers = new Set<Tier>([TIER_AUTOMATE_NOW, TIER_AUTOMATE_SOON]);
  let total = 0;
  for (const w of scored) {
    if (actionableTiers.has(w.result.tier)) {
      const hrs = TIME_MIDPOINTS[w.time_cost] ?? 0;
      total += hrs * 4; // weekly -> monthly
    }
  }
  return Math.round(total * 10) / 10;
}
