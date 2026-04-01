"""
PDF report generation using fpdf2.
Produces a branded, shareable audit report.
"""

from __future__ import annotations
import io
from datetime import date
from fpdf import FPDF
from config import TIER_CONFIG, BRAND, SITE_BASE
from scoring import estimated_hours_saved


# ── Colour helpers ─────────────────────────────────────────────────────────

def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


# ── PDF class ──────────────────────────────────────────────────────────────

class AuditReport(FPDF):
    def header(self):
        # Amber top bar
        self.set_fill_color(*hex_to_rgb(BRAND["amber"]))
        self.rect(0, 0, 210, 8, "F")

        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*hex_to_rgb(BRAND["text_bright"]))
        self.set_xy(10, 10)
        self.cell(0, 6, "AUTOMATION SWITCH — Workflow Audit Report", ln=True)

        self.set_font("Helvetica", "", 8)
        self.set_text_color(*hex_to_rgb(BRAND["text"]))
        self.cell(0, 5, f"Generated {date.today().strftime('%d %B %Y')} · automationswitch.com", ln=True)
        self.ln(4)

    def footer(self):
        self.set_y(-14)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*hex_to_rgb(BRAND["text_dim"]))
        self.cell(0, 5, f"Page {self.page_no()} · {SITE_BASE}", align="C")

    def section_title(self, text: str):
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(*hex_to_rgb(BRAND["amber"]))
        self.ln(4)
        self.cell(0, 8, text.upper(), ln=True)
        # Amber underline
        x, y = self.get_x(), self.get_y()
        self.set_draw_color(*hex_to_rgb(BRAND["amber_dark"]))
        self.line(10, y, 200, y)
        self.ln(3)

    def body_text(self, text: str, bold: bool = False):
        style = "B" if bold else ""
        self.set_font("Helvetica", style, 10)
        self.set_text_color(*hex_to_rgb(BRAND["text_bright"] if bold else "#cccccc"))
        self.multi_cell(0, 5, text)

    def tier_badge(self, tier: str):
        cfg = TIER_CONFIG.get(tier, {})
        color = cfg.get("color", "#6b7280")
        icon  = cfg.get("icon", "")
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*hex_to_rgb(color))
        self.cell(0, 5, f"{icon}  {tier}", ln=True)
        self.set_text_color(*hex_to_rgb("#cccccc"))


# ── Public function ────────────────────────────────────────────────────────

def generate_pdf_report(
    scored_workflows: list[dict],
    overall: dict,
    contextual_links: list[dict],
    user_email: str = "",
) -> bytes:
    """
    Generate a PDF audit report and return it as bytes.
    """
    pdf = AuditReport()
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.set_margins(10, 20, 10)
    pdf.add_page()

    # ── Cover summary ──────────────────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(*hex_to_rgb(BRAND["text_bright"]))
    pdf.cell(0, 10, "Workflow Automation Audit", ln=True)

    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(*hex_to_rgb(BRAND["text"]))
    pdf.cell(0, 6,
        f"Overall Automation Readiness Score: {overall['overall_score']}/100  "
        f"| Workflows assessed: {overall['total_count']}",
        ln=True)
    pdf.ln(4)

    hours = estimated_hours_saved(scored_workflows)
    if hours > 0:
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(*hex_to_rgb(BRAND["amber_bright"]))
        pdf.cell(0, 6,
            f"Estimated hours recoverable (top-priority workflows): {hours} hrs/month",
            ln=True)
    pdf.ln(6)

    # ── Priority summary table ─────────────────────────────────────────────
    pdf.section_title("Priority Summary")
    from scoring import rank_workflows
    ranked = rank_workflows(scored_workflows)

    for i, w in enumerate(ranked, 1):
        result = w["result"]
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(*hex_to_rgb(BRAND["text_bright"]))
        pdf.cell(8, 6, f"{i}.", ln=False)
        pdf.cell(100, 6, w["name"][:55], ln=False)
        pdf.cell(20, 6, f"{result['score']}/100", ln=False)

        tier_color = TIER_CONFIG.get(result["tier"], {}).get("color", "#6b7280")
        pdf.set_text_color(*hex_to_rgb(tier_color))
        pdf.cell(0, 6, result["tier"], ln=True)
        pdf.set_text_color(*hex_to_rgb(BRAND["text"]))

    pdf.ln(4)

    # ── Per-workflow breakdown ─────────────────────────────────────────────
    pdf.section_title("Detailed Workflow Breakdown")

    for w in ranked:
        result   = w["result"]
        breakdown = result.get("breakdown", {})

        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(*hex_to_rgb(BRAND["text_bright"]))
        pdf.cell(0, 7, w["name"], ln=True)

        pdf.tier_badge(result["tier"])

        if w.get("description"):
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(*hex_to_rgb(BRAND["text_dim"]))
            pdf.multi_cell(0, 5, w["description"][:200])

        # Dimension scores
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*hex_to_rgb(BRAND["text"]))
        dim_lines = [
            f"  Time Cost ({w.get('time_cost','')}) — score: {breakdown.get('time_score', 0):.0f}/100",
            f"  Error Rate ({w.get('error_rate','').split(' —')[0]}) — score: {breakdown.get('error_score', 0):.0f}/100",
            f"  Judgment Required ({w.get('judgment_pct', 0):.0f}%) — inverse score: {breakdown.get('judgment_inverse', 0):.0f}/100",
            f"  Dependency Risk ({w.get('dependency_risk','').split(' —')[0]}) — score: {breakdown.get('dependency_score', 0):.0f}/100",
            f"  Data Quality ({w.get('data_quality','').split(' —')[0]})",
        ]
        for line in dim_lines:
            pdf.cell(0, 5, line, ln=True)

        # Flag
        if result.get("flag"):
            pdf.set_font("Helvetica", "B", 9)
            pdf.set_text_color(*hex_to_rgb(BRAND["amber"]))
            pdf.multi_cell(0, 5, f"  Note: {result['flag']}")

        # Recommendation
        from content import get_recommendation
        rec = get_recommendation(w["name"], result, w)
        # Strip markdown bold markers for PDF
        rec_plain = rec.replace("**", "")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*hex_to_rgb("#aaaaaa"))
        pdf.multi_cell(0, 5, rec_plain)
        pdf.ln(3)

    # ── Do Not Automate list ───────────────────────────────────────────────
    dna = [w for w in scored_workflows if w["result"]["tier"] == "Do Not Automate"]
    cond = [w for w in scored_workflows if w["result"]["tier"] == "Conditional"]

    if dna or cond:
        pdf.section_title("Do Not Automate")
        for w in dna:
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*hex_to_rgb("#ef4444"))
            pdf.cell(0, 6, f"🔴 {w['name']} — {w['result']['flag']}", ln=True)
        for w in cond:
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*hex_to_rgb("#f97316"))
            pdf.cell(0, 6, f"🟠 {w['name']} — {w['result']['flag']}", ln=True)
        pdf.ln(3)

    # ── Recommended reading ────────────────────────────────────────────────
    pdf.section_title("Recommended Reading")
    pdf.set_font("Helvetica", "", 10)
    for article in contextual_links:
        pdf.set_text_color(*hex_to_rgb(BRAND["amber"]))
        pdf.cell(0, 5, article["title"], ln=True)
        pdf.set_text_color(*hex_to_rgb(BRAND["text_dim"]))
        pdf.cell(0, 5, article["url"], ln=True)
        pdf.ln(1)

    # ── Footer note ────────────────────────────────────────────────────────
    pdf.ln(6)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(*hex_to_rgb(BRAND["text_dim"]))
    pdf.multi_cell(0, 5,
        "This report was generated by the Automation Switch Workflow Audit Tool. "
        "Scores are based on inputs you provided and the five-dimension model "
        "developed by Automation Switch. For a professional audit engagement, "
        "visit automationswitch.com/contact.")

    return bytes(pdf.output())
