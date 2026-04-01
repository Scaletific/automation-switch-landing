"""
Automation Switch — Workflow Audit Tool
Multi-step Streamlit app: input -> score -> results (ungated) -> report (email-gated)
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

# -- Page config ---------------------------------------------------------------
st.set_page_config(
    page_title="Workflow Audit Tool — Automation Switch",
    page_icon="⚡",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# -- Design system CSS ---------------------------------------------------------
st.markdown("""
<style>
  /* ── Fonts ── */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  /* ── Reset & base ── */
  .stApp {
    background: #111113;
    color: #c0c0c8;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  html, body, [class*="css"] {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  h1, h2, h3, h4 {
    color: #f0f0f5 !important;
    font-family: 'Inter', -apple-system, sans-serif !important;
    font-weight: 700 !important;
    letter-spacing: -0.02em !important;
  }
  h1 { font-size: 2rem !important; line-height: 1.15 !important; }
  h2 { font-size: 1.5rem !important; }
  h3 { font-size: 1.15rem !important; }
  p, li, span { font-family: 'Inter', sans-serif; }

  /* ── Subtle gradient backdrop ── */
  .stApp::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 400px;
    background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(200,134,26,0.06) 0%, transparent 100%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── Step label ── */
  .step-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #c8861a;
    margin-bottom: 4px;
  }

  /* ── Progress stepper ── */
  .stepper-wrap {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 28px;
  }
  .stepper-dot {
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  .stepper-dot.active {
    background: #c8861a;
    color: #111113;
    box-shadow: 0 0 0 3px rgba(200,134,26,0.25);
  }
  .stepper-dot.completed {
    background: rgba(200,134,26,0.15);
    color: #c8861a;
  }
  .stepper-dot.upcoming {
    background: #1e1e23;
    color: #555;
    border: 1px solid #2a2a30;
  }
  .stepper-line {
    flex: 1;
    height: 2px;
    margin: 0 6px;
  }
  .stepper-line.done { background: rgba(200,134,26,0.3); }
  .stepper-line.pending { background: #2a2a30; }

  /* ── Tier badges ── */
  .tier-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
  }
  .tier-green  { background: rgba(34,197,94,0.12);  color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
  .tier-blue   { background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); }
  .tier-yellow { background: rgba(234,179,8,0.12);  color: #facc15; border: 1px solid rgba(234,179,8,0.2); }
  .tier-grey   { background: rgba(107,114,128,0.12); color: #9ca3af; border: 1px solid rgba(107,114,128,0.2); }
  .tier-red    { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
  .tier-orange { background: rgba(249,115,22,0.12); color: #fb923c; border: 1px solid rgba(249,115,22,0.2); }

  /* ── Cards ── */
  .as-card {
    background: #18181d;
    border: 1px solid #26262e;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 16px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .as-card:hover {
    border-color: #35353f;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
  }
  .result-card {
    background: #18181d;
    border: 1px solid #26262e;
    border-left: 3px solid #c8861a;
    border-radius: 0 12px 12px 0;
    padding: 18px 22px;
    margin-bottom: 12px;
    transition: all 0.2s ease;
  }
  .result-card:hover {
    background: #1c1c22;
    border-left-color: #f9b700;
  }
  .highlight-card {
    background: linear-gradient(135deg, rgba(200,134,26,0.08) 0%, rgba(200,134,26,0.02) 100%);
    border: 1px solid rgba(200,134,26,0.2);
    border-radius: 12px;
    padding: 28px;
    margin-bottom: 20px;
  }

  /* ── Stat card (replaces st.metric) ── */
  .stat-card {
    background: #18181d;
    border: 1px solid #26262e;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
  }
  .stat-value {
    font-size: 1.75rem;
    font-weight: 800;
    color: #f0f0f5;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .stat-value.amber { color: #c8861a; }
  .stat-label {
    font-size: 0.72rem;
    font-weight: 500;
    color: #777;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 6px;
  }

  /* ── Buttons ── */
  .stButton > button {
    background: #c8861a !important;
    color: #fff !important;
    font-weight: 600 !important;
    font-size: 0.9rem !important;
    border: none !important;
    border-radius: 8px !important;
    font-family: 'Inter', sans-serif !important;
    letter-spacing: 0.01em !important;
    padding: 0.55rem 1.5rem !important;
    transition: all 0.2s ease !important;
  }
  .stButton > button:hover {
    background: #e09a20 !important;
    box-shadow: 0 4px 16px rgba(200,134,26,0.3) !important;
    transform: translateY(-1px) !important;
  }
  .stButton > button:active {
    transform: translateY(0) !important;
  }

  /* Secondary / back buttons */
  div[data-testid="column"]:first-child .stButton > button {
    background: transparent !important;
    color: #888 !important;
    border: 1px solid #333 !important;
  }
  div[data-testid="column"]:first-child .stButton > button:hover {
    color: #c0c0c8 !important;
    border-color: #555 !important;
    box-shadow: none !important;
    transform: none !important;
  }

  /* ── Form styling ── */
  .stTextInput > div > div > input,
  .stTextArea > div > div > textarea {
    background: #16161b !important;
    border: 1px solid #2a2a32 !important;
    border-radius: 8px !important;
    color: #e0e0e6 !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.9rem !important;
    padding: 10px 14px !important;
    transition: border-color 0.2s ease !important;
  }
  .stTextInput > div > div > input:focus,
  .stTextArea > div > div > textarea:focus {
    border-color: #c8861a !important;
    box-shadow: 0 0 0 2px rgba(200,134,26,0.15) !important;
  }
  .stSelectbox > div > div,
  .stSelectbox [data-baseweb="select"] > div {
    background: #16161b !important;
    border-color: #2a2a32 !important;
    border-radius: 8px !important;
  }

  /* ── Labels ── */
  .stSelectbox label, .stSlider label, .stTextInput label, .stTextArea label {
    color: #999 !important;
    font-size: 0.8rem !important;
    font-weight: 500 !important;
    font-family: 'Inter', sans-serif !important;
    letter-spacing: 0.01em !important;
  }

  /* ── Slider ── */
  .stSlider [data-baseweb="slider"] div[role="slider"] {
    background: #c8861a !important;
  }

  /* ── Expander ── */
  .streamlit-expanderHeader {
    background: #18181d !important;
    border-radius: 10px !important;
    font-family: 'Inter', sans-serif !important;
    font-weight: 600 !important;
    font-size: 0.9rem !important;
  }
  details {
    border: 1px solid #26262e !important;
    border-radius: 10px !important;
    background: #18181d !important;
  }

  /* ── Dividers ── */
  hr { border-color: #222228 !important; }

  /* ── Metric overrides ── */
  [data-testid="stMetricValue"] {
    font-family: 'Inter', sans-serif !important;
    font-weight: 800 !important;
    font-size: 1.5rem !important;
    letter-spacing: -0.02em !important;
  }
  [data-testid="stMetricLabel"] {
    font-family: 'Inter', sans-serif !important;
    font-weight: 500 !important;
    font-size: 0.72rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.06em !important;
    color: #777 !important;
  }
  [data-testid="stMetricDelta"] { color: #4ade80 !important; }

  /* ── Download button ── */
  .stDownloadButton > button {
    background: transparent !important;
    color: #c8861a !important;
    border: 1px solid rgba(200,134,26,0.3) !important;
    border-radius: 8px !important;
    font-family: 'Inter', sans-serif !important;
    font-weight: 600 !important;
  }
  .stDownloadButton > button:hover {
    background: rgba(200,134,26,0.08) !important;
    border-color: #c8861a !important;
  }

  /* ── Info/Warning/Error boxes ── */
  .stAlert { border-radius: 8px !important; }

  /* ── Animations ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animate-in {
    animation: fadeUp 0.4s ease-out both;
  }

  /* ── Article card ── */
  .article-card {
    background: #18181d;
    border: 1px solid #26262e;
    border-radius: 12px;
    padding: 18px;
    height: 130px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease;
  }
  .article-card:hover {
    border-color: rgba(200,134,26,0.3);
    background: #1c1c22;
  }
  .article-card a {
    color: #e0e0e6;
    font-weight: 600;
    font-size: 0.85rem;
    text-decoration: none;
    line-height: 1.4;
  }
  .article-card a:hover { color: #c8861a; }
  .article-card p {
    font-size: 0.72rem;
    color: #666;
    line-height: 1.5;
    margin: 0;
  }

  /* ── Dimension card (scoring screen) ── */
  .dim-card {
    background: #18181d;
    border: 1px solid #26262e;
    border-radius: 12px;
    padding: 22px 24px 16px;
    margin-bottom: 14px;
  }
  .dim-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }
  .dim-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }
  .dim-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #e0e0e6;
  }
  .dim-desc {
    font-size: 0.75rem;
    color: #666;
    line-height: 1.55;
    margin-bottom: 14px;
  }

  /* ── Hide sidebar collapse button ── */
  [data-testid="collapsedControl"] { display: none; }

  /* ── Score ring ── */
  .score-ring {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px; height: 56px;
    border-radius: 50%;
    border: 3px solid;
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    font-family: 'Inter', sans-serif;
  }

  /* ── Caption override ── */
  .stCaption, [data-testid="stCaptionContainer"] {
    font-family: 'Inter', sans-serif !important;
  }

  /* ── Form submit button ── */
  [data-testid="stFormSubmitButton"] > button {
    background: #c8861a !important;
    color: #fff !important;
    font-weight: 600 !important;
    border: none !important;
    border-radius: 8px !important;
    font-family: 'Inter', sans-serif !important;
    padding: 0.55rem 1.5rem !important;
    transition: all 0.2s ease !important;
  }
  [data-testid="stFormSubmitButton"] > button:hover {
    background: #e09a20 !important;
    box-shadow: 0 4px 16px rgba(200,134,26,0.3) !important;
  }

  /* ── Progress bars ── */
  .stProgress > div > div > div {
    background: rgba(200,134,26,0.15) !important;
    border-radius: 6px !important;
  }
  .stProgress > div > div > div > div {
    background: linear-gradient(90deg, #c8861a, #e09a20) !important;
    border-radius: 6px !important;
  }
</style>
""", unsafe_allow_html=True)


# -- Session state initialisation -----------------------------------------------
def init_state():
    defaults = {
        "step":              "welcome",
        "workflows":         [],
        "score_idx":         0,
        "scored_workflows":  [],
        "email_submitted":   False,
        "email":             "",
        "pdf_bytes":         None,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v

init_state()


# -- Helpers -------------------------------------------------------------------
STEP_NAMES = ["Add Workflows", "Score", "Results"]
STEP_KEYS  = {"welcome": -1, "add": 0, "score": 1, "results": 2, "report": 2}

def stepper():
    """Render a 3-step dot stepper."""
    current = STEP_KEYS.get(st.session_state.step, 0)
    dots_html = ""
    for i, name in enumerate(STEP_NAMES):
        if i < current:
            cls = "completed"
            label = "&#10003;"
        elif i == current:
            cls = "active"
            label = str(i + 1)
        else:
            cls = "upcoming"
            label = str(i + 1)
        dots_html += f'<div class="stepper-dot {cls}">{label}</div>'
        if i < len(STEP_NAMES) - 1:
            line_cls = "done" if i < current else "pending"
            dots_html += f'<div class="stepper-line {line_cls}"></div>'
    st.markdown(f'<div class="stepper-wrap">{dots_html}</div>', unsafe_allow_html=True)


def tier_badge_html(tier: str) -> str:
    class_map = {
        "Automate Now":     "tier-green",
        "Automate Soon":    "tier-blue",
        "Evaluate Further": "tier-yellow",
        "Low Priority":     "tier-grey",
        "Do Not Automate":  "tier-red",
        "Conditional":      "tier-orange",
    }
    icon = TIER_CONFIG.get(tier, {}).get("icon", "")
    css  = class_map.get(tier, "tier-grey")
    return f'<span class="tier-badge {css}">{icon} {tier}</span>'


def score_color(score: float) -> str:
    if score >= 75: return "#4ade80"
    if score >= 50: return "#60a5fa"
    if score >= 25: return "#facc15"
    return "#9ca3af"


# -- Screen: Welcome -----------------------------------------------------------
def screen_welcome():
    st.markdown("")
    st.markdown("")

    # Brand tag
    st.markdown("""
    <div class="animate-in" style="margin-bottom:8px;">
      <span style="font-size:0.72rem;font-weight:600;letter-spacing:0.12em;
      text-transform:uppercase;color:#c8861a;
      background:rgba(200,134,26,0.1);padding:5px 12px;border-radius:20px;">
      Automation Switch &middot; Free Tool
      </span>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("")

    st.markdown("""
    <div class="animate-in" style="animation-delay:0.05s;">
      <h1 style="font-size:2.4rem !important;line-height:1.1 !important;margin-bottom:16px !important;">
        Workflow Automation<br/>Audit
      </h1>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="animate-in" style="animation-delay:0.1s;">
      <p style="font-size:1.05rem;color:#999;line-height:1.7;max-width:560px;margin-bottom:28px;">
        Most automation projects fail because teams automate the wrong things first.
        Score your workflows across five dimensions and get a ranked build order
        in under 10 minutes.
      </p>
    </div>
    """, unsafe_allow_html=True)

    # Stat cards
    c1, c2, c3 = st.columns(3)
    stats = [
        ("1-5", "Workflows"),
        ("~8 min", "To Complete"),
        ("5", "Dimensions"),
    ]
    for col, (val, label) in zip([c1, c2, c3], stats):
        with col:
            st.markdown(f"""
            <div class="stat-card animate-in" style="animation-delay:0.15s;">
              <div class="stat-value">{val}</div>
              <div class="stat-label">{label}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("")
    st.markdown("")

    # What you get
    st.markdown("""
    <div class="animate-in" style="animation-delay:0.2s;">
      <p style="font-size:0.85rem;font-weight:600;color:#e0e0e6;margin-bottom:10px;">
        What you'll get
      </p>
      <div style="display:grid;gap:8px;max-width:560px;">
        <div style="display:flex;gap:10px;align-items:start;">
          <span style="color:#c8861a;font-size:0.85rem;margin-top:1px;">&#10003;</span>
          <span style="color:#999;font-size:0.88rem;line-height:1.5;">
            A priority score (0-100) for each workflow
          </span>
        </div>
        <div style="display:flex;gap:10px;align-items:start;">
          <span style="color:#c8861a;font-size:0.85rem;margin-top:1px;">&#10003;</span>
          <span style="color:#999;font-size:0.88rem;line-height:1.5;">
            A ranked build order: what to automate first, and what to leave alone
          </span>
        </div>
        <div style="display:flex;gap:10px;align-items:start;">
          <span style="color:#c8861a;font-size:0.85rem;margin-top:1px;">&#10003;</span>
          <span style="color:#999;font-size:0.88rem;line-height:1.5;">
            A downloadable PDF report with per-workflow breakdowns
          </span>
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("")
    st.markdown("")

    if st.button("Start the Audit", use_container_width=True):
        st.session_state.step = "add"
        st.rerun()

    st.markdown("")
    st.markdown("""
    <p style="font-size:0.72rem;color:#555;text-align:center;margin-top:8px;">
    Based on the
    <a href="https://automationswitch.com/articles/automation-audit-workflow-checklist"
    target="_blank" style="color:#c8861a;text-decoration:none;">five-dimension audit framework</a>
    by Automation Switch
    </p>
    """, unsafe_allow_html=True)


# -- Screen: Add Workflows -----------------------------------------------------
def screen_add_workflows():
    stepper()

    st.markdown('<div class="step-label">Step 1 of 3</div>', unsafe_allow_html=True)
    st.markdown("## Add Your Workflows")
    st.caption(f"Add 1-{MAX_WORKFLOWS} workflows you want to evaluate. "
               "Be specific — \"Monthly client reporting\" is better than \"reporting\".")

    workflows = st.session_state.workflows

    # Existing workflow inputs
    to_remove = None
    for i, wf in enumerate(workflows):
        st.markdown(f"""
        <div class="as-card" style="animation:fadeUp 0.3s ease-out both;
        animation-delay:{i*0.05}s;">
        """, unsafe_allow_html=True)

        c1, c2 = st.columns([6, 1])
        with c1:
            wf["name"] = st.text_input(
                f"Workflow {i+1} name",
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
                placeholder="What does this workflow involve? What triggers it?",
                height=68,
            )
        with c2:
            st.markdown("<div style='height:28px'></div>", unsafe_allow_html=True)
            if st.button("Remove", key=f"remove_{i}"):
                to_remove = i
        st.markdown("</div>", unsafe_allow_html=True)

    if to_remove is not None:
        workflows.pop(to_remove)
        st.rerun()

    # Add button
    if len(workflows) < MAX_WORKFLOWS:
        st.markdown("<div style='height:4px'></div>", unsafe_allow_html=True)
        if st.button(f"+ Add workflow  ({len(workflows)}/{MAX_WORKFLOWS})", use_container_width=False):
            workflows.append({"name": "", "description": ""})
            st.rerun()
    else:
        st.caption(f"Maximum {MAX_WORKFLOWS} workflows reached.")

    st.markdown("<div style='height:16px'></div>", unsafe_allow_html=True)

    col_back, col_next = st.columns([1, 2])
    with col_back:
        if st.button("Back"):
            st.session_state.step = "welcome"
            st.rerun()
    with col_next:
        has_valid = any(w.get("name", "").strip() for w in workflows)
        if len(workflows) == 0:
            if st.button("Add your first workflow", use_container_width=True):
                workflows.append({"name": "", "description": ""})
                st.rerun()
        elif has_valid:
            if st.button("Score My Workflows", use_container_width=True):
                st.session_state.workflows = [
                    w for w in workflows if w.get("name", "").strip()
                ]
                st.session_state.score_idx = 0
                st.session_state.scored_workflows = []
                st.session_state.step = "score"
                st.rerun()
        else:
            st.info("Add at least one workflow name to continue.")


# -- Screen: Score Workflows ----------------------------------------------------
def screen_score():
    stepper()
    workflows = st.session_state.workflows
    idx       = st.session_state.score_idx
    total     = len(workflows)
    wf        = workflows[idx]
    wf_name   = wf.get("name", f"Workflow {idx+1}")

    st.markdown(f'<div class="step-label">Step 2 of 3 &mdash; Workflow {idx+1} of {total}</div>',
                unsafe_allow_html=True)
    st.markdown(f"## {wf_name}")
    if wf.get("description"):
        st.caption(wf["description"])

    st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)

    # -- Dimension 1: Time Cost --
    st.markdown("""
    <div class="dim-card">
      <div class="dim-header">
        <div class="dim-icon" style="background:rgba(200,134,26,0.1);color:#c8861a;">&#9201;</div>
        <div class="dim-title">Time Cost</div>
      </div>
      <div class="dim-desc">How many hours per week does a person spend on this workflow?
      Include setup, execution, error correction, and downstream tasks.</div>
    </div>
    """, unsafe_allow_html=True)
    time_cost = st.select_slider(
        "Hours per week",
        options=list(TIME_COST_OPTIONS.keys()),
        key=f"time_{idx}",
    )

    # -- Dimension 2: Error Rate --
    st.markdown("""
    <div class="dim-card">
      <div class="dim-header">
        <div class="dim-icon" style="background:rgba(239,68,68,0.1);color:#f87171;">&#9888;</div>
        <div class="dim-title">Error Rate</div>
      </div>
      <div class="dim-desc">How often does this workflow produce mistakes that require correction?
      Critical errors include things like wrong invoices or missed SLA-triggering events.</div>
    </div>
    """, unsafe_allow_html=True)
    error_rate = st.selectbox(
        "Error frequency",
        options=list(ERROR_RATE_OPTIONS.keys()),
        key=f"error_{idx}",
    )

    # -- Dimension 3: Dependency Risk --
    st.markdown("""
    <div class="dim-card">
      <div class="dim-header">
        <div class="dim-icon" style="background:rgba(59,130,246,0.1);color:#60a5fa;">&#128100;</div>
        <div class="dim-title">Dependency Risk</div>
      </div>
      <div class="dim-desc">How many people can run this workflow correctly? Single-person
      dependency is a business risk: if they leave, the process stops.</div>
    </div>
    """, unsafe_allow_html=True)
    dependency_risk = st.selectbox(
        "Knowledge concentration",
        options=list(DEPENDENCY_RISK_OPTIONS.keys()),
        key=f"dep_{idx}",
    )

    # -- Dimension 4: Data Quality --
    st.markdown("""
    <div class="dim-card">
      <div class="dim-header">
        <div class="dim-icon" style="background:rgba(168,85,247,0.1);color:#c084fc;">&#128451;</div>
        <div class="dim-title">Data Quality</div>
      </div>
      <div class="dim-desc">What is the quality of data flowing into this workflow?
      Automation amplifies data quality. Poor inputs produce unreliable outputs at scale.</div>
    </div>
    """, unsafe_allow_html=True)
    data_quality = st.selectbox(
        "Input data quality",
        options=list(DATA_QUALITY_OPTIONS.keys()),
        key=f"data_{idx}",
    )

    # -- Dimension 5: Judgment Required --
    st.markdown("""
    <div class="dim-card">
      <div class="dim-header">
        <div class="dim-icon" style="background:rgba(34,197,94,0.1);color:#4ade80;">&#129504;</div>
        <div class="dim-title">Judgment Required</div>
      </div>
      <div class="dim-desc">What percentage requires human judgment versus following a fixed set of rules?
      Fully rule-based workflows are ideal for automation.</div>
    </div>
    """, unsafe_allow_html=True)
    judgment_pct = st.slider(
        "Human judgment percentage",
        min_value=0, max_value=100, value=30, step=5,
        format="%d%%",
        key=f"judgment_{idx}",
        help="0% = fully rule-based | 100% = fully judgment-based",
    )
    # Contextual feedback
    if judgment_pct <= 20:
        st.success("Fully rule-based — ideal automation candidate.")
    elif judgment_pct <= 50:
        st.info("Mixed — consider which steps could be rule-based.")
    elif judgment_pct <= 70:
        st.warning("High judgment. Automate only the repeatable parts.")
    else:
        st.error("Human judgment is the value here. Do not automate.")

    st.markdown("<div style='height:16px'></div>", unsafe_allow_html=True)

    col_back, col_next = st.columns([1, 2])
    with col_back:
        if st.button("Back"):
            if idx == 0:
                st.session_state.step = "add"
            else:
                st.session_state.score_idx -= 1
                st.session_state.scored_workflows.pop()
            st.rerun()
    with col_next:
        label = "Next Workflow" if idx < total - 1 else "See My Results"
        if st.button(label, use_container_width=True):
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


# -- Screen: Results (ungated) -------------------------------------------------
def screen_results():
    scored  = st.session_state.scored_workflows
    ranked  = rank_workflows(scored)
    overall = calculate_overall_readiness(scored)
    hours   = estimated_hours_saved(scored)
    links   = get_contextual_links(scored)

    stepper()
    st.markdown('<div class="step-label">Your Results</div>', unsafe_allow_html=True)
    st.markdown("## Automation Audit Results")

    # -- Overall stats --
    c1, c2, c3, c4 = st.columns(4)
    stat_data = [
        (f"{overall['overall_score']}", "Readiness Score", overall['overall_score'] >= 50),
        (str(overall["total_count"]), "Workflows", False),
        (str(overall.get("automate_now", 0)), "Automate Now", True),
        (f"{hours}" if hours else "—", "Hrs/Mo Recoverable", hours > 0),
    ]
    for col, (val, label, highlight) in zip([c1, c2, c3, c4], stat_data):
        with col:
            val_cls = "stat-value amber" if highlight else "stat-value"
            st.markdown(f"""
            <div class="stat-card animate-in">
              <div class="{val_cls}">{val}</div>
              <div class="stat-label">{label}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)

    # -- #1 Priority callout --
    actionable = [w for w in ranked if w["result"]["tier"] not in (TIER_DO_NOT_AUTOMATE, TIER_CONDITIONAL)]
    if actionable:
        top = actionable[0]
        rec = get_recommendation(top["name"], top["result"], top)
        sc  = top["result"]["score"]
        st.markdown(f"""
        <div class="highlight-card animate-in" style="animation-delay:0.1s;">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div>
              <div style="font-size:0.7rem;font-weight:600;letter-spacing:0.1em;
              text-transform:uppercase;color:#c8861a;margin-bottom:8px;">
              Top Priority
              </div>
              <div style="font-size:1.25rem;font-weight:700;color:#f0f0f5;margin-bottom:10px;">
              {top["name"]}
              </div>
              <div style="margin-bottom:12px;">
              {tier_badge_html(top["result"]["tier"])}
              </div>
            </div>
            <div class="score-ring" style="border-color:{score_color(sc)};color:{score_color(sc)};">
              {sc:.0f}
            </div>
          </div>
          <p style="color:#999;font-size:0.88rem;line-height:1.6;margin:0;">
          {rec.replace("**", "")}
          </p>
        </div>
        """, unsafe_allow_html=True)

    # -- Ranked list --
    st.markdown("<div style='height:4px'></div>", unsafe_allow_html=True)
    st.markdown("### All Workflows Ranked")
    st.markdown("<div style='height:4px'></div>", unsafe_allow_html=True)

    for i, w in enumerate(ranked, 1):
        result = w["result"]
        is_special = result["tier"] in (TIER_DO_NOT_AUTOMATE, TIER_CONDITIONAL)
        sc = result["score"]
        opacity = "opacity:0.55;" if is_special else ""
        border_color = TIER_CONFIG.get(result["tier"], {}).get("color", "#c8861a")
        st.markdown(f"""
        <div class="result-card animate-in"
             style="border-left-color:{border_color};{opacity}animation-delay:{i*0.05}s;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="color:#555;font-size:0.8rem;font-weight:600;">
              {i}</span>
              <span style="color:#e0e0e6;font-weight:600;font-size:0.95rem;">{w["name"]}</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              {tier_badge_html(result["tier"])}
              <span style="color:{score_color(sc)};font-weight:700;font-size:0.9rem;">{sc:.0f}</span>
            </div>
          </div>
          {'<p style="color:#f97316;font-size:0.78rem;margin:8px 0 0;line-height:1.4;">' + result["flag"] + "</p>" if result.get("flag") else ""}
        </div>
        """, unsafe_allow_html=True)

    # Flags summary
    if overall.get("do_not_automate", 0) or overall.get("conditional", 0):
        st.markdown(f"""
        <p style="color:#666;font-size:0.78rem;margin-top:4px;">
        {overall.get('do_not_automate',0)} workflow(s) flagged Do Not Automate &middot;
        {overall.get('conditional',0)} flagged Conditional (fix data first)
        </p>
        """, unsafe_allow_html=True)

    # -- Article cross-links --
    st.markdown("<div style='height:24px'></div>", unsafe_allow_html=True)
    st.markdown("### Recommended Reading")
    st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
    cols = st.columns(min(len(links), 3))
    for i, article in enumerate(links[:3]):
        with cols[i]:
            st.markdown(f"""
            <div class="article-card animate-in" style="animation-delay:{0.1+i*0.05}s;">
              <a href="{article['url']}" target="_blank">{article['title']}</a>
              <p>{article['desc']}</p>
            </div>
            """, unsafe_allow_html=True)

    # -- CTA to detailed report --
    st.markdown("<div style='height:32px'></div>", unsafe_allow_html=True)
    st.markdown(f"""
    <div class="highlight-card" style="text-align:center;">
      <div style="font-size:1.2rem;font-weight:700;color:#f0f0f5;margin-bottom:8px;">
      Get Your Full Report
      </div>
      <p style="color:#888;font-size:0.88rem;max-width:480px;margin:0 auto 20px;line-height:1.6;">
      Enter your email for the complete per-workflow breakdown with score contributions,
      the Do Not Automate list with reasoning, and a PDF to share with your team.
      </p>
    </div>
    """, unsafe_allow_html=True)

    with st.form("email_gate"):
        email = st.text_input("Your email", placeholder="you@company.com")
        first_name = st.text_input("First name (optional)", placeholder="")
        submitted = st.form_submit_button(
            "Send Me the Full Report", use_container_width=True
        )

    if submitted:
        if not email or "@" not in email:
            st.error("Please enter a valid email address.")
        else:
            st.session_state.email = email
            subscribe_to_beehiiv(email, first_name)
            pdf_bytes = generate_pdf_report(scored, overall, links, email)
            st.session_state.pdf_bytes = pdf_bytes
            st.session_state.email_submitted = True
            st.session_state.step = "report"
            st.rerun()


# -- Screen: Detailed Report (email-gated) -------------------------------------
def screen_report():
    scored  = st.session_state.scored_workflows
    ranked  = rank_workflows(scored)
    overall = calculate_overall_readiness(scored)
    hours   = estimated_hours_saved(scored)
    links   = get_contextual_links(scored)

    stepper()
    st.markdown("""
    <div style="margin-bottom:8px;">
      <span style="font-size:0.72rem;font-weight:600;letter-spacing:0.1em;
      text-transform:uppercase;color:#4ade80;
      background:rgba(34,197,94,0.1);padding:5px 12px;border-radius:20px;">
      Report Unlocked
      </span>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("## Full Audit Report")
    st.caption("Subscribed to Automation Switch updates · One email per week · Unsubscribe any time")

    # PDF download
    if st.session_state.pdf_bytes:
        st.download_button(
            label="Download PDF Report",
            data=st.session_state.pdf_bytes,
            file_name="automation-audit-report.pdf",
            mime="application/pdf",
            use_container_width=True,
        )

    st.markdown("<div style='height:16px'></div>", unsafe_allow_html=True)

    # -- Overall stats --
    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown(f"""
        <div class="stat-card">
          <div class="stat-value amber">{overall['overall_score']}</div>
          <div class="stat-label">Overall Readiness</div>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown(f"""
        <div class="stat-card">
          <div class="stat-value">{overall['actionable_count']}</div>
          <div class="stat-label">Actionable Workflows</div>
        </div>
        """, unsafe_allow_html=True)
    with c3:
        hrs_display = f"{hours}" if hours else "—"
        st.markdown(f"""
        <div class="stat-card">
          <div class="stat-value">{hrs_display}</div>
          <div class="stat-label">Hrs/Mo Recoverable</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)

    # -- Per-workflow breakdown --
    st.markdown("### Per-Workflow Breakdown")
    st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)

    for w in ranked:
        result    = w["result"]
        breakdown = result.get("breakdown", {})
        tier_cfg  = TIER_CONFIG.get(result["tier"], {})
        sc = result["score"]

        with st.expander(
            f"{tier_cfg.get('icon','')}  {w['name']} — {sc:.0f}/100 · {result['tier']}",
            expanded=(result["tier"] in (TIER_AUTOMATE_NOW, TIER_AUTOMATE_SOON)),
        ):
            # Dimension scores in a clean grid
            dc1, dc2 = st.columns(2)
            with dc1:
                st.metric("Time Cost", w.get("time_cost", "—").split("/")[0])
                st.metric("Error Rate", w.get("error_rate", "—").split(" —")[0])
                st.metric("Dependency Risk", w.get("dependency_risk", "—").split(" —")[0])
            with dc2:
                st.metric("Judgment Required", f"{w.get('judgment_pct',0):.0f}%")
                st.metric("Data Quality", w.get("data_quality", "—").split(" —")[0])
                st.metric("Composite Score", f"{sc:.0f}/100",
                          delta=tier_cfg.get("label", ""))

            # Weighted contribution
            st.markdown("**Score contribution by dimension**")
            time_contrib  = breakdown.get("time_score", 0) * 0.30
            error_contrib = breakdown.get("error_score", 0) * 0.25
            judg_contrib  = breakdown.get("judgment_inverse", 0) * 0.25
            dep_contrib   = breakdown.get("dependency_score", 0) * 0.20

            for label_text, contrib in [
                ("Time cost", time_contrib),
                ("Error rate", error_contrib),
                ("Rule-based", judg_contrib),
                ("Dependency", dep_contrib),
            ]:
                pct = min(int(contrib), 100)
                st.markdown(f"""
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                  <span style="font-size:0.75rem;color:#888;width:80px;">{label_text}</span>
                  <div style="flex:1;height:6px;background:#1e1e23;border-radius:3px;overflow:hidden;">
                    <div style="width:{pct}%;height:100%;background:linear-gradient(90deg,#c8861a,#e09a20);
                    border-radius:3px;transition:width 0.5s ease;"></div>
                  </div>
                  <span style="font-size:0.75rem;color:#999;width:45px;text-align:right;">{contrib:.1f} pts</span>
                </div>
                """, unsafe_allow_html=True)

            # Flag
            if result.get("flag"):
                st.warning(result["flag"])

            # Recommendation
            rec = get_recommendation(w["name"], result, w)
            st.markdown(rec)

    # -- Do Not Automate list --
    dna  = [w for w in scored if w["result"]["tier"] == TIER_DO_NOT_AUTOMATE]
    cond = [w for w in scored if w["result"]["tier"] == TIER_CONDITIONAL]

    if dna or cond:
        st.markdown("<div style='height:16px'></div>", unsafe_allow_html=True)
        st.markdown("### Do Not Automate")
        for w in dna:
            st.markdown(f"""
            <div class="result-card" style="border-left-color:#ef4444;">
              <span style="color:#f87171;font-weight:600;font-size:0.95rem;">
              {TIER_CONFIG[TIER_DO_NOT_AUTOMATE]['icon']} {w['name']}</span>
              <p style="color:#888;font-size:0.82rem;margin:6px 0 0;line-height:1.5;">
              {w['result']['flag']}</p>
            </div>
            """, unsafe_allow_html=True)
        for w in cond:
            st.markdown(f"""
            <div class="result-card" style="border-left-color:#f97316;">
              <span style="color:#fb923c;font-weight:600;font-size:0.95rem;">
              {TIER_CONFIG[TIER_CONDITIONAL]['icon']} {w['name']}</span>
              <p style="color:#888;font-size:0.82rem;margin:6px 0 0;line-height:1.5;">
              {w['result']['flag']}</p>
            </div>
            """, unsafe_allow_html=True)

    # -- Tool recommendations --
    st.markdown("<div style='height:16px'></div>", unsafe_allow_html=True)
    st.markdown("### Recommended Tools")
    st.markdown("""
    <p style="font-size:0.88rem;color:#888;margin-bottom:12px;">
    Based on your workflow types, these are the most relevant tools to evaluate first:
    </p>
    """, unsafe_allow_html=True)
    for article in links:
        st.markdown(f"**[{article['title']}]({article['url']})** — {article['desc']}")

    # -- CTA: Professional audit --
    st.markdown("<div style='height:24px'></div>", unsafe_allow_html=True)
    st.markdown(f"""
    <div class="highlight-card" style="text-align:center;">
      <div style="font-size:1.1rem;font-weight:700;color:#f0f0f5;margin-bottom:8px;">
      Want a professional audit?
      </div>
      <p style="color:#888;font-size:0.85rem;margin-bottom:16px;max-width:440px;
      margin-left:auto;margin-right:auto;line-height:1.6;">
      This tool gives you the framework. A professional engagement gives you
      the implementation plan, tooling decisions, and accountability for delivery.
      </p>
      <a href="{SITE_BASE}/contact" target="_blank"
      style="display:inline-block;background:#c8861a;color:#fff;
      padding:10px 28px;font-weight:600;font-size:0.88rem;
      font-family:'Inter',sans-serif;text-decoration:none;border-radius:8px;
      transition:all 0.2s ease;">
      Talk to Automation Switch
      </a>
    </div>
    """, unsafe_allow_html=True)

    # Start over
    st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)
    if st.button("Run Another Audit"):
        for key in ["workflows", "scored_workflows", "score_idx",
                    "email_submitted", "email", "pdf_bytes"]:
            del st.session_state[key]
        st.session_state.step = "welcome"
        st.rerun()


# -- Router -------------------------------------------------------------------
SCREENS = {
    "welcome": screen_welcome,
    "add":     screen_add_workflows,
    "score":   screen_score,
    "results": screen_results,
    "report":  screen_report,
}

SCREENS.get(st.session_state.step, screen_welcome)()
