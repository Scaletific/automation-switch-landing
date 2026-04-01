"use client";

import { useReducer, useState, useCallback } from "react";
import {
  TIME_COST_OPTIONS,
  ERROR_RATE_OPTIONS,
  DEPENDENCY_RISK_OPTIONS,
  DATA_QUALITY_OPTIONS,
  TIER_CONFIG,
  MAX_WORKFLOWS,
  SITE_BASE,
  TIER_DO_NOT_AUTOMATE,
  TIER_CONDITIONAL,
  TIER_AUTOMATE_NOW,
  TIER_AUTOMATE_SOON,
  type Tier,
} from "./config";
import {
  calculatePriorityScore,
  calculateOverallReadiness,
  rankWorkflows,
  estimatedHoursSaved,
  type WorkflowInput,
  type ScoredWorkflow,
} from "./scoring";
import { getContextualLinks, getRecommendation, TOOLTIPS } from "./content";

// -- State -------------------------------------------------------------------

type Step = "welcome" | "add" | "score" | "results" | "report";

interface WizardState {
  step: Step;
  workflows: { name: string; description: string }[];
  scoreIdx: number;
  scoredWorkflows: ScoredWorkflow[];
  emailSubmitted: boolean;
  email: string;
  pdfBytes: Blob | null;
}

type Action =
  | { type: "SET_STEP"; step: Step }
  | { type: "ADD_WORKFLOW" }
  | { type: "REMOVE_WORKFLOW"; idx: number }
  | { type: "UPDATE_WORKFLOW"; idx: number; field: "name" | "description"; value: string }
  | { type: "SCORE_WORKFLOW"; scored: ScoredWorkflow }
  | { type: "NEXT_SCORE" }
  | { type: "PREV_SCORE" }
  | { type: "START_SCORING" }
  | { type: "SUBMIT_EMAIL"; email: string; pdfBytes: Blob }
  | { type: "RESET" };

const initial: WizardState = {
  step: "welcome",
  workflows: [],
  scoreIdx: 0,
  scoredWorkflows: [],
  emailSubmitted: false,
  email: "",
  pdfBytes: null,
};

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "ADD_WORKFLOW":
      return {
        ...state,
        workflows: [...state.workflows, { name: "", description: "" }],
      };
    case "REMOVE_WORKFLOW":
      return {
        ...state,
        workflows: state.workflows.filter((_, i) => i !== action.idx),
      };
    case "UPDATE_WORKFLOW":
      return {
        ...state,
        workflows: state.workflows.map((w, i) =>
          i === action.idx ? { ...w, [action.field]: action.value } : w
        ),
      };
    case "START_SCORING": {
      const valid = state.workflows.filter((w) => w.name.trim());
      return {
        ...state,
        workflows: valid,
        scoreIdx: 0,
        scoredWorkflows: [],
        step: "score",
      };
    }
    case "SCORE_WORKFLOW": {
      const newScored = [...state.scoredWorkflows, action.scored];
      const isLast = state.scoreIdx >= state.workflows.length - 1;
      return {
        ...state,
        scoredWorkflows: newScored,
        scoreIdx: isLast ? state.scoreIdx : state.scoreIdx + 1,
        step: isLast ? "results" : "score",
      };
    }
    case "PREV_SCORE": {
      if (state.scoreIdx === 0) return { ...state, step: "add" };
      return {
        ...state,
        scoreIdx: state.scoreIdx - 1,
        scoredWorkflows: state.scoredWorkflows.slice(0, -1),
      };
    }
    case "SUBMIT_EMAIL":
      return {
        ...state,
        email: action.email,
        pdfBytes: action.pdfBytes,
        emailSubmitted: true,
        step: "report",
      };
    case "RESET":
      return { ...initial };
    default:
      return state;
  }
}

// -- Tier badge component ----------------------------------------------------

function TierBadge({ tier }: { tier: Tier }) {
  const cfg = TIER_CONFIG[tier];
  return (
    <span
      className="audit-tier-badge"
      style={{
        color: cfg.color,
        background: cfg.bgColor,
        borderColor: cfg.color,
      }}
    >
      {cfg.icon} {tier}
    </span>
  );
}

// -- Score indicator ---------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#3b82f6";
  if (score >= 25) return "#c8861a";
  return "#6b7280";
}

// -- Stepper -----------------------------------------------------------------

const STEP_LABELS = ["Add Workflows", "Score", "Results"];
const STEP_MAP: Record<Step, number> = {
  welcome: -1,
  add: 0,
  score: 1,
  results: 2,
  report: 2,
};

function Stepper({ step }: { step: Step }) {
  const current = STEP_MAP[step];
  return (
    <div className="audit-stepper">
      {STEP_LABELS.map((label, i) => {
        let cls = "audit-stepper-dot upcoming";
        let content: string = String(i + 1);
        if (i < current) {
          cls = "audit-stepper-dot completed";
          content = "✓";
        } else if (i === current) {
          cls = "audit-stepper-dot active";
        }
        return (
          <div key={label} className="audit-stepper-segment">
            {i > 0 && (
              <div
                className={`audit-stepper-line ${i <= current ? "done" : ""}`}
              />
            )}
            <div className={cls}>{content}</div>
            <span className="audit-stepper-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// -- Main wizard component ---------------------------------------------------

export default function AuditWizard() {
  const [state, dispatch] = useReducer(reducer, initial);

  switch (state.step) {
    case "welcome":
      return <WelcomeScreen dispatch={dispatch} />;
    case "add":
      return (
        <AddWorkflowsScreen
          workflows={state.workflows}
          dispatch={dispatch}
        />
      );
    case "score":
      return (
        <ScoreScreen
          workflows={state.workflows}
          scoreIdx={state.scoreIdx}
          dispatch={dispatch}
        />
      );
    case "results":
      return (
        <ResultsScreen
          scoredWorkflows={state.scoredWorkflows}
          dispatch={dispatch}
        />
      );
    case "report":
      return (
        <ReportScreen
          scoredWorkflows={state.scoredWorkflows}
          pdfBytes={state.pdfBytes}
          dispatch={dispatch}
        />
      );
  }
}

// == WELCOME SCREEN ==========================================================

function WelcomeScreen({ dispatch }: { dispatch: React.Dispatch<Action> }) {
  return (
    <div className="audit-page">
      <div className="audit-welcome">
        <div className="page-eyebrow">Free Tool</div>
        <h1 className="audit-hero-title">
          WORKFLOW
          <br />
          AUTOMATION
          <br />
          AUDIT
        </h1>
        <p className="audit-hero-sub">
          Most automation projects fail because teams automate the wrong things
          first. Score your workflows across five dimensions and get a ranked
          build order in under 10 minutes.
        </p>

        <div className="audit-stat-band">
          {[
            ["1–5", "Workflows"],
            ["~8 min", "To complete"],
            ["5", "Dimensions scored"],
          ].map(([val, label]) => (
            <div key={label} className="audit-stat-cell">
              <div className="audit-stat-val">{val}</div>
              <div className="audit-stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="audit-checklist">
          <p className="audit-checklist-heading">What you will get</p>
          {[
            "A priority score (0–100) for each workflow",
            "A ranked build order: what to automate first, and what to leave alone",
            "A downloadable PDF report with per-workflow breakdowns",
          ].map((item) => (
            <div key={item} className="audit-checklist-item">
              <span className="audit-check">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <button
          className="btn-primary audit-cta"
          onClick={() => {
            dispatch({ type: "ADD_WORKFLOW" });
            dispatch({ type: "SET_STEP", step: "add" });
          }}
        >
          Start the Audit
        </button>

        <p className="audit-source-note">
          Based on the{" "}
          <a href={`${SITE_BASE}/articles/automation-audit-workflow-checklist`}>
            five-dimension audit framework
          </a>{" "}
          by Automation Switch
        </p>
      </div>
    </div>
  );
}

// == ADD WORKFLOWS SCREEN ====================================================

function AddWorkflowsScreen({
  workflows,
  dispatch,
}: {
  workflows: { name: string; description: string }[];
  dispatch: React.Dispatch<Action>;
}) {
  const hasValid = workflows.some((w) => w.name.trim());

  return (
    <div className="audit-page">
      <Stepper step="add" />
      <div className="audit-step-label">Step 1 of 3</div>
      <h2 className="audit-section-title">ADD YOUR WORKFLOWS</h2>
      <p className="audit-section-sub">
        Add 1–{MAX_WORKFLOWS} workflows you want to evaluate. Be specific —
        &quot;Monthly client reporting&quot; is better than
        &quot;reporting&quot;.
      </p>

      <div className="audit-workflow-list">
        {workflows.map((wf, i) => (
          <div key={i} className="audit-workflow-card">
            <div className="audit-workflow-card-header">
              <span className="audit-workflow-num">{i + 1}</span>
              <button
                className="audit-remove-btn"
                onClick={() => dispatch({ type: "REMOVE_WORKFLOW", idx: i })}
                aria-label={`Remove workflow ${i + 1}`}
              >
                ✕
              </button>
            </div>
            <label className="audit-label" htmlFor={`wf-name-${i}`}>
              Workflow name *
            </label>
            <input
              id={`wf-name-${i}`}
              type="text"
              className="audit-input"
              placeholder="e.g. Monthly client reporting"
              maxLength={100}
              value={wf.name}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_WORKFLOW",
                  idx: i,
                  field: "name",
                  value: e.target.value,
                })
              }
            />
            <label className="audit-label" htmlFor={`wf-desc-${i}`}>
              Brief description (optional)
            </label>
            <textarea
              id={`wf-desc-${i}`}
              className="audit-textarea"
              placeholder="What does this workflow involve? What triggers it?"
              maxLength={300}
              rows={2}
              value={wf.description}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_WORKFLOW",
                  idx: i,
                  field: "description",
                  value: e.target.value,
                })
              }
            />
          </div>
        ))}
      </div>

      {workflows.length < MAX_WORKFLOWS && (
        <button
          className="btn-ghost audit-add-btn"
          onClick={() => dispatch({ type: "ADD_WORKFLOW" })}
        >
          + Add workflow ({workflows.length}/{MAX_WORKFLOWS})
        </button>
      )}
      {workflows.length >= MAX_WORKFLOWS && (
        <p className="audit-note">Maximum {MAX_WORKFLOWS} workflows reached.</p>
      )}

      <div className="audit-nav">
        <button
          className="btn-ghost"
          onClick={() => dispatch({ type: "SET_STEP", step: "welcome" })}
        >
          Back
        </button>
        {workflows.length === 0 ? (
          <button
            className="btn-primary"
            onClick={() => dispatch({ type: "ADD_WORKFLOW" })}
          >
            Add your first workflow
          </button>
        ) : hasValid ? (
          <button
            className="btn-primary"
            onClick={() => dispatch({ type: "START_SCORING" })}
          >
            Score My Workflows
          </button>
        ) : (
          <p className="audit-note">Add at least one workflow name to continue.</p>
        )}
      </div>
    </div>
  );
}

// == SCORE SCREEN ============================================================

function ScoreScreen({
  workflows,
  scoreIdx,
  dispatch,
}: {
  workflows: { name: string; description: string }[];
  scoreIdx: number;
  dispatch: React.Dispatch<Action>;
}) {
  const wf = workflows[scoreIdx];
  const total = workflows.length;

  const [timeCost, setTimeCost] = useState(Object.keys(TIME_COST_OPTIONS)[0]);
  const [errorRate, setErrorRate] = useState(Object.keys(ERROR_RATE_OPTIONS)[0]);
  const [depRisk, setDepRisk] = useState(Object.keys(DEPENDENCY_RISK_OPTIONS)[0]);
  const [dataQuality, setDataQuality] = useState(Object.keys(DATA_QUALITY_OPTIONS)[0]);
  const [judgmentPct, setJudgmentPct] = useState(30);

  const handleSubmit = useCallback(() => {
    const input: WorkflowInput = {
      name: wf.name,
      description: wf.description,
      time_cost: timeCost,
      error_rate: errorRate,
      dependency_risk: depRisk,
      data_quality: dataQuality,
      judgment_pct: judgmentPct,
    };
    const result = calculatePriorityScore(input);
    dispatch({ type: "SCORE_WORKFLOW", scored: { ...input, result } });
    // Reset form defaults for next workflow
    setTimeCost(Object.keys(TIME_COST_OPTIONS)[0]);
    setErrorRate(Object.keys(ERROR_RATE_OPTIONS)[0]);
    setDepRisk(Object.keys(DEPENDENCY_RISK_OPTIONS)[0]);
    setDataQuality(Object.keys(DATA_QUALITY_OPTIONS)[0]);
    setJudgmentPct(30);
  }, [wf, timeCost, errorRate, depRisk, dataQuality, judgmentPct, dispatch]);

  const judgmentFeedback =
    judgmentPct <= 20
      ? { text: "Fully rule-based — ideal automation candidate.", color: "#22c55e" }
      : judgmentPct <= 50
        ? { text: "Mixed — consider which steps could be rule-based.", color: "#3b82f6" }
        : judgmentPct <= 70
          ? { text: "High judgment. Automate only the repeatable parts.", color: "#c8861a" }
          : { text: "Human judgment is the value here. Do not automate.", color: "#ef4444" };

  return (
    <div className="audit-page">
      <Stepper step="score" />
      <div className="audit-step-label">
        Step 2 of 3 — Workflow {scoreIdx + 1} of {total}
      </div>
      <h2 className="audit-section-title">{wf.name.toUpperCase()}</h2>
      {wf.description && <p className="audit-section-sub">{wf.description}</p>}

      <div className="audit-dimensions">
        {/* Time Cost */}
        <div className="audit-dim-card">
          <div className="audit-dim-header">
            <span className="audit-dim-icon" style={{ color: "var(--amber)" }}>⏱</span>
            <span className="audit-dim-title">Time Cost</span>
          </div>
          <p className="audit-dim-desc">{TOOLTIPS.time_cost}</p>
          <label className="audit-label" htmlFor="time-cost">
            Hours per week
          </label>
          <select
            id="time-cost"
            className="audit-select"
            value={timeCost}
            onChange={(e) => setTimeCost(e.target.value)}
          >
            {Object.keys(TIME_COST_OPTIONS).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Error Rate */}
        <div className="audit-dim-card">
          <div className="audit-dim-header">
            <span className="audit-dim-icon" style={{ color: "#ef4444" }}>⚠</span>
            <span className="audit-dim-title">Error Rate</span>
          </div>
          <p className="audit-dim-desc">{TOOLTIPS.error_rate}</p>
          <label className="audit-label" htmlFor="error-rate">
            Error frequency
          </label>
          <select
            id="error-rate"
            className="audit-select"
            value={errorRate}
            onChange={(e) => setErrorRate(e.target.value)}
          >
            {Object.keys(ERROR_RATE_OPTIONS).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Dependency Risk */}
        <div className="audit-dim-card">
          <div className="audit-dim-header">
            <span className="audit-dim-icon" style={{ color: "#3b82f6" }}>👤</span>
            <span className="audit-dim-title">Dependency Risk</span>
          </div>
          <p className="audit-dim-desc">{TOOLTIPS.dependency_risk}</p>
          <label className="audit-label" htmlFor="dep-risk">
            Knowledge concentration
          </label>
          <select
            id="dep-risk"
            className="audit-select"
            value={depRisk}
            onChange={(e) => setDepRisk(e.target.value)}
          >
            {Object.keys(DEPENDENCY_RISK_OPTIONS).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Data Quality */}
        <div className="audit-dim-card">
          <div className="audit-dim-header">
            <span className="audit-dim-icon" style={{ color: "#8b5cf6" }}>🗄</span>
            <span className="audit-dim-title">Data Quality</span>
          </div>
          <p className="audit-dim-desc">{TOOLTIPS.data_quality}</p>
          <label className="audit-label" htmlFor="data-quality">
            Input data quality
          </label>
          <select
            id="data-quality"
            className="audit-select"
            value={dataQuality}
            onChange={(e) => setDataQuality(e.target.value)}
          >
            {Object.keys(DATA_QUALITY_OPTIONS).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Judgment Required */}
        <div className="audit-dim-card">
          <div className="audit-dim-header">
            <span className="audit-dim-icon" style={{ color: "#22c55e" }}>🧠</span>
            <span className="audit-dim-title">Judgment Required</span>
          </div>
          <p className="audit-dim-desc">{TOOLTIPS.judgment_pct}</p>
          <label className="audit-label" htmlFor="judgment">
            Human judgment percentage: {judgmentPct}%
          </label>
          <input
            id="judgment"
            type="range"
            className="audit-range"
            min={0}
            max={100}
            step={5}
            value={judgmentPct}
            onChange={(e) => setJudgmentPct(Number(e.target.value))}
          />
          <div className="audit-range-labels">
            <span>0% Rule-based</span>
            <span>100% Judgment</span>
          </div>
          <p className="audit-judgment-feedback" style={{ color: judgmentFeedback.color }}>
            {judgmentFeedback.text}
          </p>
        </div>
      </div>

      <div className="audit-nav">
        <button
          className="btn-ghost"
          onClick={() => dispatch({ type: "PREV_SCORE" })}
        >
          Back
        </button>
        <button className="btn-primary" onClick={handleSubmit}>
          {scoreIdx < total - 1 ? "Next Workflow" : "See My Results"}
        </button>
      </div>
    </div>
  );
}

// == RESULTS SCREEN (ungated) ================================================

function ResultsScreen({
  scoredWorkflows,
  dispatch,
}: {
  scoredWorkflows: ScoredWorkflow[];
  dispatch: React.Dispatch<Action>;
}) {
  const ranked = rankWorkflows(scoredWorkflows);
  const overall = calculateOverallReadiness(scoredWorkflows);
  const hours = estimatedHoursSaved(scoredWorkflows);
  const links = getContextualLinks(scoredWorkflows);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const actionable = ranked.filter(
    (w) =>
      w.result.tier !== TIER_DO_NOT_AUTOMATE &&
      w.result.tier !== TIER_CONDITIONAL
  );
  const top = actionable[0] ?? null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      // Subscribe via existing API route
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Generate PDF (dynamic import to keep bundle lean)
      const { generatePdfReport } = await import("./pdf-generator");
      const pdfBlob = await generatePdfReport(scoredWorkflows, overall, links);

      dispatch({ type: "SUBMIT_EMAIL", email, pdfBytes: pdfBlob });
    } catch {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="audit-page">
      <Stepper step="results" />
      <div className="audit-step-label">Your Results</div>
      <h2 className="audit-section-title">AUTOMATION AUDIT RESULTS</h2>

      {/* Overall stats */}
      <div className="audit-stat-band four">
        {[
          [String(overall.overall_score), "Readiness Score"],
          [String(overall.total_count), "Workflows"],
          [String(overall.automate_now), "Automate Now"],
          [hours ? String(hours) : "—", "Hrs/Mo Recoverable"],
        ].map(([val, label]) => (
          <div key={label} className="audit-stat-cell">
            <div className="audit-stat-val">{val}</div>
            <div className="audit-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Top priority callout */}
      {top && (
        <div className="audit-top-priority">
          <div className="audit-top-priority-eyebrow">Top Priority</div>
          <div className="audit-top-priority-row">
            <div>
              <h3 className="audit-top-priority-name">{top.name}</h3>
              <TierBadge tier={top.result.tier} />
            </div>
            <div
              className="audit-score-ring"
              style={{ borderColor: scoreColor(top.result.score) }}
            >
              <span style={{ color: scoreColor(top.result.score) }}>
                {top.result.score.toFixed(0)}
              </span>
            </div>
          </div>
          <p className="audit-top-priority-rec">
            {getRecommendation(top.name, top.result, top)}
          </p>
        </div>
      )}

      {/* Ranked list */}
      <h3 className="audit-subsection-title">ALL WORKFLOWS RANKED</h3>
      <div className="audit-ranked-list">
        {ranked.map((w, i) => {
          const isSpecial =
            w.result.tier === TIER_DO_NOT_AUTOMATE ||
            w.result.tier === TIER_CONDITIONAL;
          return (
            <div
              key={i}
              className={`audit-result-row ${isSpecial ? "dimmed" : ""}`}
              style={{
                borderLeftColor: TIER_CONFIG[w.result.tier].color,
              }}
            >
              <div className="audit-result-row-left">
                <span className="audit-result-num">{i + 1}</span>
                <span className="audit-result-name">{w.name}</span>
              </div>
              <div className="audit-result-row-right">
                <TierBadge tier={w.result.tier} />
                <span
                  className="audit-result-score"
                  style={{ color: scoreColor(w.result.score) }}
                >
                  {w.result.score.toFixed(0)}
                </span>
              </div>
              {w.result.flag && (
                <p className="audit-result-flag">{w.result.flag}</p>
              )}
            </div>
          );
        })}
      </div>

      {(overall.do_not_automate > 0 || overall.conditional > 0) && (
        <p className="audit-flag-summary">
          {overall.do_not_automate} workflow(s) flagged Do Not Automate ·{" "}
          {overall.conditional} flagged Conditional (fix data first)
        </p>
      )}

      {/* Article cross-links */}
      <h3 className="audit-subsection-title">RECOMMENDED READING</h3>
      <div className="audit-article-grid">
        {links.slice(0, 3).map((article) => (
          <a
            key={article.url}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="audit-article-card"
          >
            <span className="audit-article-title">{article.title}</span>
            <span className="audit-article-desc">{article.desc}</span>
          </a>
        ))}
      </div>

      {/* Email gate CTA */}
      <div className="audit-email-gate">
        <h3 className="audit-email-gate-title">Get Your Full Report</h3>
        <p className="audit-email-gate-desc">
          Enter your email for the complete per-workflow breakdown with score
          contributions, the Do Not Automate list with reasoning, and a PDF to
          share with your team.
        </p>
        <form className="audit-email-form" onSubmit={handleEmailSubmit}>
          <input
            type="email"
            className="audit-input"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            className="audit-input"
            placeholder="First name (optional)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary audit-cta"
            disabled={submitting}
          >
            {submitting ? "Generating report..." : "Send Me the Full Report"}
          </button>
          {error && <p className="audit-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}

// == REPORT SCREEN (email-gated) =============================================

function ReportScreen({
  scoredWorkflows,
  pdfBytes,
  dispatch,
}: {
  scoredWorkflows: ScoredWorkflow[];
  pdfBytes: Blob | null;
  dispatch: React.Dispatch<Action>;
}) {
  const ranked = rankWorkflows(scoredWorkflows);
  const overall = calculateOverallReadiness(scoredWorkflows);
  const hours = estimatedHoursSaved(scoredWorkflows);
  const links = getContextualLinks(scoredWorkflows);

  const downloadPdf = useCallback(() => {
    if (!pdfBytes) return;
    const url = URL.createObjectURL(pdfBytes);
    const a = document.createElement("a");
    a.href = url;
    a.download = "automation-audit-report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }, [pdfBytes]);

  return (
    <div className="audit-page">
      <Stepper step="report" />
      <div className="audit-step-label" style={{ color: "#22c55e" }}>
        Report Unlocked
      </div>
      <h2 className="audit-section-title">FULL AUDIT REPORT</h2>
      <p className="audit-note">
        Subscribed to Automation Switch updates · One email per week ·
        Unsubscribe any time
      </p>

      {pdfBytes && (
        <button className="btn-ghost audit-download-btn" onClick={downloadPdf}>
          ⬇ Download PDF Report
        </button>
      )}

      {/* Overall stats */}
      <div className="audit-stat-band">
        {[
          [String(overall.overall_score), "Overall Readiness"],
          [String(overall.actionable_count), "Actionable Workflows"],
          [hours ? String(hours) : "—", "Hrs/Mo Recoverable"],
        ].map(([val, label]) => (
          <div key={label} className="audit-stat-cell">
            <div className="audit-stat-val">{val}</div>
            <div className="audit-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Per-workflow breakdown */}
      <h3 className="audit-subsection-title">PER-WORKFLOW BREAKDOWN</h3>
      {ranked.map((w, i) => {
        const { result } = w;
        const { breakdown } = result;
        const cfg = TIER_CONFIG[result.tier];
        const contribs = [
          { label: "Time cost", val: breakdown.time_score * 0.3 },
          { label: "Error rate", val: breakdown.error_score * 0.25 },
          { label: "Rule-based", val: breakdown.judgment_inverse * 0.25 },
          { label: "Dependency", val: breakdown.dependency_score * 0.2 },
        ];

        return (
          <details
            key={i}
            className="audit-breakdown-card"
            open={
              result.tier === TIER_AUTOMATE_NOW ||
              result.tier === TIER_AUTOMATE_SOON
            }
          >
            <summary className="audit-breakdown-summary">
              <span>
                {cfg.icon} {w.name} — {result.score.toFixed(0)}/100 ·{" "}
                {result.tier}
              </span>
            </summary>
            <div className="audit-breakdown-body">
              <div className="audit-breakdown-grid">
                <div className="audit-breakdown-metric">
                  <span className="audit-breakdown-metric-label">Time Cost</span>
                  <span className="audit-breakdown-metric-val">
                    {w.time_cost.split("/")[0]}
                  </span>
                </div>
                <div className="audit-breakdown-metric">
                  <span className="audit-breakdown-metric-label">Error Rate</span>
                  <span className="audit-breakdown-metric-val">
                    {w.error_rate.split(" —")[0]}
                  </span>
                </div>
                <div className="audit-breakdown-metric">
                  <span className="audit-breakdown-metric-label">
                    Dependency Risk
                  </span>
                  <span className="audit-breakdown-metric-val">
                    {w.dependency_risk.split(" —")[0]}
                  </span>
                </div>
                <div className="audit-breakdown-metric">
                  <span className="audit-breakdown-metric-label">Judgment</span>
                  <span className="audit-breakdown-metric-val">
                    {w.judgment_pct}%
                  </span>
                </div>
                <div className="audit-breakdown-metric">
                  <span className="audit-breakdown-metric-label">
                    Data Quality
                  </span>
                  <span className="audit-breakdown-metric-val">
                    {w.data_quality.split(" —")[0]}
                  </span>
                </div>
                <div className="audit-breakdown-metric">
                  <span className="audit-breakdown-metric-label">
                    Composite Score
                  </span>
                  <span className="audit-breakdown-metric-val">
                    {result.score.toFixed(0)}/100
                  </span>
                </div>
              </div>

              <p className="audit-breakdown-contribs-title">
                Score contribution by dimension
              </p>
              {contribs.map(({ label, val }) => (
                <div key={label} className="audit-contrib-row">
                  <span className="audit-contrib-label">{label}</span>
                  <div className="audit-contrib-bar">
                    <div
                      className="audit-contrib-fill"
                      style={{ width: `${Math.min(val, 100)}%` }}
                    />
                  </div>
                  <span className="audit-contrib-val">{val.toFixed(1)} pts</span>
                </div>
              ))}

              {result.flag && (
                <p className="audit-breakdown-flag">{result.flag}</p>
              )}
              <p className="audit-breakdown-rec">
                {getRecommendation(w.name, result, w)}
              </p>
            </div>
          </details>
        );
      })}

      {/* Do Not Automate list */}
      {(() => {
        const dna = scoredWorkflows.filter(
          (w) => w.result.tier === TIER_DO_NOT_AUTOMATE
        );
        const cond = scoredWorkflows.filter(
          (w) => w.result.tier === TIER_CONDITIONAL
        );
        if (!dna.length && !cond.length) return null;
        return (
          <>
            <h3 className="audit-subsection-title">DO NOT AUTOMATE</h3>
            {dna.map((w, i) => (
              <div
                key={`dna-${i}`}
                className="audit-result-row"
                style={{ borderLeftColor: "#ef4444" }}
              >
                <span style={{ color: "#ef4444", fontWeight: 600 }}>
                  🔴 {w.name}
                </span>
                <p className="audit-result-flag">{w.result.flag}</p>
              </div>
            ))}
            {cond.map((w, i) => (
              <div
                key={`cond-${i}`}
                className="audit-result-row"
                style={{ borderLeftColor: "#f97316" }}
              >
                <span style={{ color: "#f97316", fontWeight: 600 }}>
                  🟠 {w.name}
                </span>
                <p className="audit-result-flag">{w.result.flag}</p>
              </div>
            ))}
          </>
        );
      })()}

      {/* Recommended tools */}
      <h3 className="audit-subsection-title">RECOMMENDED TOOLS</h3>
      <p className="audit-note" style={{ marginBottom: 16 }}>
        Based on your workflow types, these are the most relevant tools to
        evaluate first:
      </p>
      {links.map((article) => (
        <p key={article.url} className="audit-tool-link">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>{" "}
          — {article.desc}
        </p>
      ))}

      {/* Professional audit CTA */}
      <div className="audit-pro-cta">
        <h3 className="audit-pro-cta-title">Want a professional audit?</h3>
        <p className="audit-pro-cta-desc">
          This tool gives you the framework. A professional engagement gives you
          the implementation plan, tooling decisions, and accountability for
          delivery.
        </p>
        <a
          href={`${SITE_BASE}/contact`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Talk to Automation Switch
        </a>
      </div>

      {/* Start over */}
      <button
        className="btn-ghost"
        style={{ marginTop: 40 }}
        onClick={() => dispatch({ type: "RESET" })}
      >
        Run Another Audit
      </button>
    </div>
  );
}
