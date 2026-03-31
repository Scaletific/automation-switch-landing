"""
Automation Switch — Workflow Audit Tool
Multi-step Streamlit app: input → score → results (ungated) → report (email-gated)
"""

import streamlit as st
from scoring import calculate_priority_score, calculate_overall_readiness, rank_workflows, estimated_hours_saved
from content import get_contextual_links, get_recommendation, TOOLTIPS
from beehiiv import subscribe_to_beehiiv
from pdf_generator import generate_pdf_report
from config import (
    TIME_COST_OPTIONS, ERROR_RATE_OPTIONS, DEPENDENCY_RISK_OPTIONS,
    DATA_QUALITY_OPTIONS, TIER_CONFIG, BRAND, MAX_WORKFLOWS, SITE_BASE,
    TIER_DO_NOT_AUTOMATE, TIER_CONDITIONAL, TIER_AUTOMATE_NOW, TIER_AUTOMATE_SOON,
)

# ── Page config ────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Workflow Audit Tool — Automation Switch",
    page_icon="⚡",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# ── Brand CSS injection ────────────────────────────────────────────────────
st.markdown("""
<style>
  /* Base */
  .stApp { background-color: #1e1e1e; color: #b0b0b0; }
  h1, h2, h3 { color: #e8e8e8 !important; font-family: 'Courier New', monospace; }
  p, li { color: #b0b0b0; }

  /* Amber accent */
  .amber { color: #c8861a; }
  .amber-bright { color: #f9b700; }

  /* Progress bar */
  .progress-bar-wrap {
    background: #282828; border-radius: 4px; height: 6px; margin-bottom: 24px;
  }
  .progress-bar-fill {
    background: #c8861a; height: 6px; border-radius: 4px;
    transition: width 0.3s ease;
  }

  /* Tier badges */
  .tier-badge {
    display: inline-block; padding: 2px 10px; border-radius: 3px;
    font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
    font-family: 'Courier New', monospace;
  }
  .tier-green  { background: #14532d; color: #22c55e; }
  .tier-blue   { background: #1e3a5f; color: #3b82f6; }
  .tier-yellow { background: #422006; color: #eab308; }
  .tier-grey   { background: #1f2937; color: #6b7280; }
  .tier-red    { background: #450a0a; color: #ef4444; }
  .tier-orange { background: #431407; color: #f97316; }

  /* Cards */
  .workflow-card {
    background: #282828; border: 1px solid #3a3a3a; border-radius: 6px;
    padding: 20px; margin-bottom: 16px;
  }
  .result-card {
    background: #282828; border-left: 3px solid #c8861a;
    padding: 16px 20px; margin-bottom: 12px; border-radius: 0 6px 6px 0;
  }
  .highlight-card {
    background: #1a1500; border: 1px solid #c8861a; border-radius: 6px;
    padding: 20px; margin-bottom: 20px;
  }

  /* Buttons */
  .stButton > button {
    background-color: #c8861a !important;
    color: #1e1e1e !important;
    font-weight: 700 !important;
    border: none !important;
    border-radius: 3px !important;
    font-family: 'Courier New', monospace !important;
    letter-spacing: 0.06em !important;
  }
  .stButton > button:hover { background-color: #f9b700 !important; }

  /* Divider */
  hr { border-color: #3a3a3a !important; }

  /* Metric delta */
  [data-testid="stMetricDelta"] { color: #22c55e; }

  /* Input labels */
  .stSelectbox label, .stSlider label, .stTextInput label, .stTextArea label {
    color: #b0b0b0 !important; font-size: 13px !important;
  }
</style>
""", unsafe_allow_html=True)


# ── Session state initialisation ───────────────────────────────────────────
def init_state():
    defaults = {
        "step":              "welcome",   # welcome | add | score | results | report
        "workflows":         [],          # list of dicts with name, description, scores
        "score_idx":         0,           # which workflow we're currently scoring
        "scored_workflows":  [],          # list of {name, description, ..., result}
        "email_submitted":   False,
        "email":             "",
        "pdf_bytes":         None,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v

init_state()


# ── Helper: progress bar ────────────────────────────────────────────────────
STEP_PROGRESS = {"welcome": 0, "add": 20, "score": 60, "results": 80, "report": 100}

def progress_bar():
    pct = STEP_PROGRESS.get(st.session_state.step, 0)
    st.markdown(f"""
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" style="width:{pct}%"></div>
    </div>
    """, unsafe_allow_html=True)


def tier_badge_html(tier: str) -> str:
    class_map = {
        "Automate Now":    "tier-green",
        "Automate Soon":   "tier-blue",
        "Evaluate Further": "tier-yellow",
        "Low Priority":    "tier-grey",
        "Do Not Automate": "tier-red",
        "Conditional":     "tier-orange",
    }
    icon = TIER_CONFIG.get(tier, {}).get("icon", "")
    css  = class_map.get(tier, "tier-grey")
    return f'<span class="tier-badge {css}">{icon} {tier}</span>'


# ── Screen: Welcome ────────────────────────────────────────────────────────
def screen_welcome():
    st.markdown("""
    <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.2em;
    text-transform:uppercase;color:#c8861a;margin-bottom:12px;">
    Automation Switch · Free Tool
    </div>
    """, unsafe_allow_html=True)

    st.title("Workflow Automation Audit")

    st.markdown("""
    <p style="font-size:16px;color:#e8e8e8;line-height:1.7;margin-bottom:20px;">
    Most automation projects fail because teams automate the wrong things first.
    This tool scores your workflows across five dimensions and tells you
    exactly what to automate, what to leave alone, and what to fix before you build.
    </p>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Workflows", "1–5", help="Score up to 5 workflows per session")
    with col2:
        st.metric("Time to complete", "7–10 min")
    with col3:
        st.metric("Dimensions scored", "5")

    st.markdown("---")

    st.markdown("""
    **What you will get:**
    - A priority score (0–100) for each workflow
    - A ranked build order: what to automate first, second, and not at all
    - A "Do Not Automate" list with reasoning
    - A detailed report (free) with per-workflow breakdowns and tool recommendations
    """)

    st.markdown("""
    <p style="font-size:12px;color:#6b6b6b;margin-top:12px;">
    Based on the five-dimension framework from
    <a href="https://automationswitch.com/articles/automation-audit-workflow-checklist"
    target="_blank" style="color:#c8861a;">What a Good Automation Audit Should Actually Include</a>.
    </p>
    """, unsafe_allow_html=True)

    st.markdown("")
    if st.button("Start the Audit →", use_container_width=True):
        st.session_state.step = "add"
        st.rerun()


# ── Screen: Add Workflows ──────────────────────────────────────────────────
def screen_add_workflows():
    progress_bar()
    st.markdown("""
    <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.2em;
    text-transform:uppercase;color:#c8861a;margin-bottom:4px;">Step 1 of 3</div>
    """, unsafe_allow_html=True)
    st.header("Add Your Workflows")
    st.caption(f"Add 1–{MAX_WORKFLOWS} workflows you want to evaluate. Be specific — "
               "\"Monthly client reporting\" is better than \"reporting\".")

    workflows = st.session_state.workflows

    # Display existing workflow inputs
    to_remove = None
    for i, wf in enumerate(workflows):
        with st.container():
            st.markdown(f'<div class="workflow-card">', unsafe_allow_html=True)
            c1, c2 = st.columns([5, 1])
            with c1:
                wf["name"] = st.text_input(
                    f"Workflow {i+1} name *",
                    value=wf.get("name", ""),
                    max_chars=100,
                    key=f"wf_name_{i}",
                    placeholder="e.g. Monthly client reporting",
                )
                wf["description"] = st.text_area(
                    "Brief description (optional)",
                    value=wf.get("description", ""),
                    max_chars=300,
                    key=f"wf_desc_{i}",
                    placeholder="What does this workflow involve? What triggers it? Who does it?",
                    height=70,
                )
            with c2:
                st.markdown("<br><br>", unsafe_allow_html=True)
                if st.button("✕", key=f"remove_{i}", help="Remove this workflow"):
                    to_remove = i
            st.markdown("</div>", unsafe_allow_html=True)

    if to_remove is not None:
        workflows.pop(to_remove)
        st.rerun()

    # Add workflow button
    if len(workflows) < MAX_WORKFLOWS:
        if st.button(f"+ Add workflow ({len(workflows)}/{MAX_WORKFLOWS})", use_container_width=False):
            workflows.append({"name": "", "description": ""})
            st.rerun()
    else:
        st.caption(f"Maximum {MAX_WORKFLOWS} workflows reached.")

    st.markdown("---")

    col_back, col_next = st.columns([1, 2])
    with col_back:
        if st.button("← Back"):
            st.session_state.step = "welcome"
            st.rerun()
    with col_next:
        has_valid = any(w.get("name", "").strip() for w in workflows)
        if len(workflows) == 0:
            if st.button("+ Add your first workflow →", use_container_width=True):
                workflows.append({"name": "", "description": ""})
                st.rerun()
        elif has_valid:
            if st.button("Score My Workflows →", use_container_width=True):
                # Filter to non-empty names
                st.session_state.workflows = [
                    w for w in workflows if w.get("name", "").strip()
                ]
                st.session_state.score_idx = 0
                st.session_state.scored_workflows = []
                st.session_state.step = "score"
                st.rerun()
        else:
            st.info("Add at least one workflow name to continue.")


# ── Screen: Score Workflows ────────────────────────────────────────────────
def screen_score():
    progress_bar()
    workflows = st.session_state.workflows
    idx       = st.session_state.score_idx
    total     = len(workflows)
    wf        = workflows[idx]
    wf_name   = wf.get("name", f"Workflow {idx+1}")

    st.markdown(f"""
    <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.2em;
    text-transform:uppercase;color:#c8861a;margin-bottom:4px;">
    Step 2 of 3 — Workflow {idx+1} of {total}
    </div>
    """, unsafe_allow_html=True)

    st.header(f"Score: {wf_name}")
    if wf.get("description"):
        st.caption(wf["description"])

    st.markdown("---")

    # Dimension 1: Time Cost
    with st.expander("⏱  Time Cost", expanded=True):
        st.caption(TOOLTIPS["time_cost"])
        time_cost = st.select_slider(
            "Hours spent on this workflow per week",
            options=list(TIME_COST_OPTIONS.keys()),
            key=f"time_{idx}",
        )

    # Dimension 2: Error Rate
    with st.expander("⚠️  Error Rate", expanded=True):
        st.caption(TOOLTIPS["error_rate"])
        error_rate = st.selectbox(
            "How often does this workflow produce errors?",
            options=list(ERROR_RATE_OPTIONS.keys()),
            key=f"error_{idx}",
        )

    # Dimension 3: Dependency Risk
    with st.expander("👤  Dependency Risk", expanded=True):
        st.caption(TOOLTIPS["dependency_risk"])
        dependency_risk = st.selectbox(
            "How many people can run this workflow correctly?",
            options=list(DEPENDENCY_RISK_OPTIONS.keys()),
            key=f"dep_{idx}",
        )

    # Dimension 4: Data Quality
    with st.expander("🗄  Data Quality", expanded=True):
        st.caption(TOOLTIPS["data_quality"])
        data_quality = st.selectbox(
            "What is the quality of data flowing into this workflow?",
            options=list(DATA_QUALITY_OPTIONS.keys()),
            key=f"data_{idx}",
        )

    # Dimension 5: Judgment Required
    with st.expander("🧠  Judgment Required", expanded=True):
        st.caption(TOOLTIPS["judgment_pct"])
        judgment_pct = st.slider(
            "What % of this workflow requires human judgment?",
            min_value=0, max_value=100, value=30, step=5,
            format="%d%%",
            key=f"judgment_{idx}",
            help="0% = fully rule-based · 100% = fully judgment-based",
        )
        if judgment_pct <= 20:
            st.success("Fully rule-based — ideal automation candidate.")
        elif judgment_pct <= 50:
            st.info("Mixed. Consider which steps could be rule-based.")
        elif judgment_pct <= 70:
            st.warning("High judgment. Automate the repeatable parts only.")
        else:
            st.error("Human judgment is the value here. Do not automate.")

    st.markdown("---")
    col_back, col_next = st.columns([1, 2])
    with col_back:
        if st.button("← Back"):
            if idx == 0:
                st.session_state.step = "add"
            else:
                st.session_state.score_idx -= 1
                st.session_state.scored_workflows.pop()
            st.rerun()
    with col_next:
        label = "Next Workflow →" if idx < total - 1 else "See My Results →"
        if st.button(label, use_container_width=True):
            # Build full workflow dict with scores
            scored_wf = {
                **wf,
                "time_cost":       time_cost,
                "error_rate":      error_rate,
                "dependency_risk": dependency_risk,
                "data_quality":    data_quality,
                "judgment_pct":    judgment_pct,
                "result":          calculate_priority_score({
                    "time_cost":       time_cost,
                    "error_rate":      error_rate,
                    "dependency_risk": dependency_risk,
                    "data_quality":    data_quality,
                    "judgment_pct":    judgment_pct,
                }),
            }
            st.session_state.scored_workflows.append(scored_wf)

            if idx < total - 1:
                st.session_state.score_idx += 1
            else:
                st.session_state.step = "results"
            st.rerun()


# ── Screen: Results (ungated) ──────────────────────────────────────────────
def screen_results():
    scored   = st.session_state.scored_workflows
    ranked   = rank_workflows(scored)
    overall  = calculate_overall_readiness(scored)
    hours    = estimated_hours_saved(scored)
    links    = get_contextual_links(scored)

    progress_bar()
    st.markdown("""
    <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.2em;
    text-transform:uppercase;color:#c8861a;margin-bottom:4px;">Step 3 of 3 — Your Results</div>
    """, unsafe_allow_html=True)
    st.header("Automation Audit Results")

    # ── Overall readiness ──────────────────────────────────────────────────
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Readiness Score", f"{overall['overall_score']}/100")
    c2.metric("Workflows Assessed", overall["total_count"])
    c3.metric("Automate Now", overall.get("automate_now", 0))
    c4.metric("Hours/Month Recoverable", f"{hours}" if hours else "—")

    st.markdown("---")

    # ── #1 Priority callout ────────────────────────────────────────────────
    actionable = [w for w in ranked if w["result"]["tier"] not in (TIER_DO_NOT_AUTOMATE, TIER_CONDITIONAL)]
    if actionable:
        top = actionable[0]
        tier_cfg = TIER_CONFIG.get(top["result"]["tier"], {})
        rec = get_recommendation(top["name"], top["result"], top)
        st.markdown(f"""
        <div class="highlight-card">
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.15em;
          text-transform:uppercase;color:#c8861a;margin-bottom:6px;">
          Top Priority
          </div>
          <div style="font-size:18px;font-weight:700;color:#e8e8e8;margin-bottom:8px;">
          {top["name"]}
          </div>
          <div style="margin-bottom:8px;">
          {tier_badge_html(top["result"]["tier"])}
          &nbsp;<span style="color:#6b6b6b;font-size:12px;">{top["result"]["score"]}/100</span>
          </div>
          <p style="color:#b0b0b0;font-size:14px;line-height:1.6;margin:0;">
          {rec.replace("**", "")}
          </p>
        </div>
        """, unsafe_allow_html=True)

    # ── Ranked list ────────────────────────────────────────────────────────
    st.subheader("All Workflows Ranked")
    for i, w in enumerate(ranked, 1):
        result = w["result"]
        is_special = result["tier"] in (TIER_DO_NOT_AUTOMATE, TIER_CONDITIONAL)
        score_display = f"{result['score']}/100"
        st.markdown(f"""
        <div class="result-card" style="{'border-left-color:#3a3a3a;opacity:0.7' if is_special else ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <span style="color:#6b6b6b;font-size:11px;font-family:'Courier New',monospace;">
              #{i}</span>
              &nbsp;
              <span style="color:#e8e8e8;font-weight:700;font-size:15px;">{w["name"]}</span>
            </div>
            <div>
              {tier_badge_html(result["tier"])}
              &nbsp;
              <span style="color:#6b6b6b;font-size:12px;">{score_display}</span>
            </div>
          </div>
          {'<p style="color:#f97316;font-size:12px;margin:6px 0 0;">' + result["flag"] + "</p>" if result.get("flag") else ""}
        </div>
        """, unsafe_allow_html=True)

    # ── Separator ──────────────────────────────────────────────────────────
    if overall.get("do_not_automate", 0) or overall.get("conditional", 0):
        st.markdown(f"""
        <p style="color:#6b6b6b;font-size:13px;margin-top:4px;">
        {overall.get('do_not_automate',0)} workflow(s) flagged Do Not Automate ·
        {overall.get('conditional',0)} flagged Conditional (fix data first)
        </p>
        """, unsafe_allow_html=True)

    # ── Article cross-links ────────────────────────────────────────────────
    st.markdown("---")
    st.subheader("Recommended Reading")
    cols = st.columns(min(len(links), 3))
    for i, article in enumerate(links[:3]):
        with cols[i]:
            st.markdown(f"""
            <div class="workflow-card" style="height:100px;">
              <a href="{article['url']}" target="_blank"
              style="color:#c8861a;font-weight:700;font-size:13px;text-decoration:none;">
              {article['title']}
              </a>
              <p style="font-size:11px;color:#6b6b6b;margin-top:6px;line-height:1.5;">
              {article['desc']}
              </p>
            </div>
            """, unsafe_allow_html=True)

    # ── CTA to detailed report ─────────────────────────────────────────────
    st.markdown("---")
    st.markdown("""
    <div style="text-align:center;padding:20px 0 8px;">
      <div style="font-size:18px;font-weight:700;color:#e8e8e8;margin-bottom:8px;">
      Get Your Full Report
      </div>
      <p style="color:#b0b0b0;font-size:14px;max-width:500px;margin:0 auto 16px;">
      Enter your email for the complete per-workflow breakdown with specific tool
      recommendations, the Do Not Automate list with reasoning, and a PDF to share
      with your team.
      </p>
    </div>
    """, unsafe_allow_html=True)

    with st.form("email_gate"):
        email = st.text_input("Your email *", placeholder="you@company.com")
        first_name = st.text_input("First name (optional)", placeholder="")
        submitted = st.form_submit_button(
            "Send Me the Full Report →", use_container_width=True
        )

    if submitted:
        if not email or "@" not in email:
            st.error("Please enter a valid email address.")
        else:
            st.session_state.email = email
            # Subscribe to Beehiiv — non-blocking
            subscribe_to_beehiiv(email, first_name)
            # Generate PDF
            pdf_bytes = generate_pdf_report(scored, overall, links, email)
            st.session_state.pdf_bytes = pdf_bytes
            st.session_state.email_submitted = True
            st.session_state.step = "report"
            st.rerun()


# ── Screen: Detailed Report (email-gated) ──────────────────────────────────
def screen_report():
    scored  = st.session_state.scored_workflows
    ranked  = rank_workflows(scored)
    overall = calculate_overall_readiness(scored)
    hours   = estimated_hours_saved(scored)
    links   = get_contextual_links(scored)

    progress_bar()
    st.markdown("""
    <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.2em;
    text-transform:uppercase;color:#22c55e;margin-bottom:4px;">Report Unlocked</div>
    """, unsafe_allow_html=True)
    st.header("Full Audit Report")
    st.caption(
        f"Subscribed to Automation Switch updates · "
        f"One email per week · Unsubscribe any time"
    )

    # PDF download
    if st.session_state.pdf_bytes:
        st.download_button(
            label="⬇  Download PDF Report",
            data=st.session_state.pdf_bytes,
            file_name="automation-audit-report.pdf",
            mime="application/pdf",
            use_container_width=True,
        )

    st.markdown("---")

    # ── Overall stats ──────────────────────────────────────────────────────
    c1, c2, c3 = st.columns(3)
    c1.metric("Overall Readiness", f"{overall['overall_score']}/100")
    c2.metric("Actionable Workflows", overall["actionable_count"])
    if hours:
        c3.metric("Hours/Month Recoverable", f"{hours}")

    st.markdown("---")

    # ── Per-workflow breakdown ─────────────────────────────────────────────
    st.subheader("Per-Workflow Breakdown")

    for w in ranked:
        result    = w["result"]
        breakdown = result.get("breakdown", {})
        tier_cfg  = TIER_CONFIG.get(result["tier"], {})

        with st.expander(
            f"{tier_cfg.get('icon','⚪')}  {w['name']} — {result['score']}/100 · {result['tier']}",
            expanded=(result["tier"] in (TIER_AUTOMATE_NOW, TIER_AUTOMATE_SOON)),
        ):
            # Dimension scores
            st.markdown("**Dimension Scores**")
            dc1, dc2 = st.columns(2)
            with dc1:
                st.metric("Time Cost", w.get("time_cost", "—").split("/")[0])
                st.metric("Error Rate", w.get("error_rate", "—").split(" —")[0])
                st.metric("Dependency Risk", w.get("dependency_risk", "—").split(" —")[0])
            with dc2:
                st.metric("Judgment Required", f"{w.get('judgment_pct',0):.0f}%")
                st.metric("Data Quality", w.get("data_quality", "—").split(" —")[0])
                st.metric("Composite Score", f"{result['score']}/100",
                          delta=tier_cfg.get("label", ""))

            # Weighted contribution bar
            st.markdown("**Score contribution by dimension**")
            time_contrib  = breakdown.get("time_score", 0) * 0.30
            error_contrib = breakdown.get("error_score", 0) * 0.25
            judg_contrib  = breakdown.get("judgment_inverse", 0) * 0.25
            dep_contrib   = breakdown.get("dependency_score", 0) * 0.20
            st.progress(int(time_contrib),   text=f"Time cost: {time_contrib:.1f} pts")
            st.progress(int(error_contrib),  text=f"Error rate: {error_contrib:.1f} pts")
            st.progress(int(judg_contrib),   text=f"Rule-based score: {judg_contrib:.1f} pts")
            st.progress(int(dep_contrib),    text=f"Dependency risk: {dep_contrib:.1f} pts")

            # Flag
            if result.get("flag"):
                st.warning(result["flag"])

            # Recommendation
            rec = get_recommendation(w["name"], result, w)
            st.markdown(rec)

    # ── Do Not Automate list ───────────────────────────────────────────────
    dna  = [w for w in scored if w["result"]["tier"] == TIER_DO_NOT_AUTOMATE]
    cond = [w for w in scored if w["result"]["tier"] == TIER_CONDITIONAL]

    if dna or cond:
        st.markdown("---")
        st.subheader("Do Not Automate")
        for w in dna:
            st.markdown(f"""
            <div class="result-card" style="border-left-color:#ef4444;">
              <span style="color:#ef4444;font-weight:700;">🔴 {w['name']}</span>
              <p style="color:#b0b0b0;font-size:13px;margin:4px 0 0;">{w['result']['flag']}</p>
            </div>
            """, unsafe_allow_html=True)
        for w in cond:
            st.markdown(f"""
            <div class="result-card" style="border-left-color:#f97316;">
              <span style="color:#f97316;font-weight:700;">🟠 {w['name']}</span>
              <p style="color:#b0b0b0;font-size:13px;margin:4px 0 0;">{w['result']['flag']}</p>
            </div>
            """, unsafe_allow_html=True)

    # ── Tool recommendations by workflow ───────────────────────────────────
    st.markdown("---")
    st.subheader("Recommended Tools")
    st.markdown("""
    Based on your workflow types, these are the most relevant tools to evaluate first:
    """)
    for article in links:
        st.markdown(f"""
        **[{article['title']}]({article['url']})**
        {article['desc']}
        """)

    # ── CTA: Audit service ────────────────────────────────────────────────
    st.markdown("---")
    st.markdown(f"""
    <div class="highlight-card" style="text-align:center;">
      <div style="font-size:15px;font-weight:700;color:#e8e8e8;margin-bottom:8px;">
      Want a professional audit?
      </div>
      <p style="color:#b0b0b0;font-size:13px;margin-bottom:12px;">
      This tool gives you the framework. A professional engagement gives you
      the implementation plan, tooling decisions, and someone accountable for delivery.
      </p>
      <a href="{SITE_BASE}/contact" target="_blank"
      style="background:#c8861a;color:#1e1e1e;padding:10px 24px;font-weight:700;
      font-family:'Courier New',monospace;text-decoration:none;border-radius:3px;
      font-size:13px;letter-spacing:0.06em;">
      Talk to Automation Switch →
      </a>
    </div>
    """, unsafe_allow_html=True)

    # ── Start over ─────────────────────────────────────────────────────────
    st.markdown("")
    if st.button("Run Another Audit", use_container_width=False):
        for key in ["workflows", "scored_workflows", "score_idx",
                    "email_submitted", "email", "pdf_bytes"]:
            del st.session_state[key]
        st.session_state.step = "welcome"
        st.rerun()


# ── Router ─────────────────────────────────────────────────────────────────
SCREENS = {
    "welcome": screen_welcome,
    "add":     screen_add_workflows,
    "score":   screen_score,
    "results": screen_results,
    "report":  screen_report,
}

SCREENS.get(st.session_state.step, screen_welcome)()
