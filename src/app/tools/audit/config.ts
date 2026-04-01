/**
 * Scoring weights, input options, priority tiers, and brand constants.
 * All magic numbers live here — change thresholds and weights without touching logic.
 */

// -- Scoring weights (must sum to 1.0) ----------------------------------------
export const WEIGHTS = {
  time_cost: 0.3,
  error_rate: 0.25,
  judgment_inverse: 0.25,
  dependency_risk: 0.2,
} as const;

// -- Input options -> normalised 0-100 scores ---------------------------------
export const TIME_COST_OPTIONS: Record<string, number> = {
  "Less than 1 hr/week": 5,
  "1–2 hrs/week": 20,
  "2–5 hrs/week": 40,
  "5–10 hrs/week": 60,
  "10–20 hrs/week": 80,
  "20+ hrs/week": 100,
};

export const ERROR_RATE_OPTIONS: Record<string, number> = {
  "Low — rarely makes errors": 0,
  "Medium — occasional mistakes needing fixes": 33,
  "High — frequent errors causing rework": 67,
  "Critical — errors have significant business impact": 100,
};

export const DEPENDENCY_RISK_OPTIONS: Record<string, number> = {
  "Low — anyone on the team can do it": 0,
  "Medium — 2–3 people know how": 50,
  "High — only one person knows how to do it": 100,
};

export const DATA_QUALITY_OPTIONS: Record<string, number> = {
  "High — structured digital data": 100,
  "Medium — mostly structured, some manual entry": 67,
  "Low — mix of formats, some inconsistent": 33,
  "Poor — unstructured, manual, inconsistent": 0,
};

// -- Priority tiers -----------------------------------------------------------
export const TIER_AUTOMATE_NOW = "Automate Now" as const;
export const TIER_AUTOMATE_SOON = "Automate Soon" as const;
export const TIER_EVALUATE = "Evaluate Further" as const;
export const TIER_LOW_PRIORITY = "Low Priority" as const;
export const TIER_DO_NOT_AUTOMATE = "Do Not Automate" as const;
export const TIER_CONDITIONAL = "Conditional" as const;

export type Tier =
  | typeof TIER_AUTOMATE_NOW
  | typeof TIER_AUTOMATE_SOON
  | typeof TIER_EVALUATE
  | typeof TIER_LOW_PRIORITY
  | typeof TIER_DO_NOT_AUTOMATE
  | typeof TIER_CONDITIONAL;

export interface TierConfig {
  min: number;
  color: string;
  bgColor: string;
  icon: string;
  label: string;
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  [TIER_AUTOMATE_NOW]: {
    min: 75,
    color: "#22c55e",
    bgColor: "rgba(34,197,94,0.1)",
    icon: "🟢",
    label: "Automate Now",
  },
  [TIER_AUTOMATE_SOON]: {
    min: 50,
    color: "#3b82f6",
    bgColor: "rgba(59,130,246,0.1)",
    icon: "🔵",
    label: "Automate Soon",
  },
  [TIER_EVALUATE]: {
    min: 25,
    color: "#eab308",
    bgColor: "rgba(234,179,8,0.1)",
    icon: "🟡",
    label: "Evaluate Further",
  },
  [TIER_LOW_PRIORITY]: {
    min: 0,
    color: "#6b7280",
    bgColor: "rgba(107,114,128,0.1)",
    icon: "⚪",
    label: "Low Priority",
  },
  [TIER_DO_NOT_AUTOMATE]: {
    min: -1,
    color: "#ef4444",
    bgColor: "rgba(239,68,68,0.1)",
    icon: "🔴",
    label: "Do Not Automate",
  },
  [TIER_CONDITIONAL]: {
    min: -1,
    color: "#f97316",
    bgColor: "rgba(249,115,22,0.1)",
    icon: "🟠",
    label: "Conditional",
  },
};

// Judgment % threshold — above this, flag as "Do Not Automate"
export const JUDGMENT_OVERRIDE_THRESHOLD = 70;

// Max workflows per session
export const MAX_WORKFLOWS = 5;

// Site base URL
export const SITE_BASE = "https://automationswitch.com";
