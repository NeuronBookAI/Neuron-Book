"""
POST /api/question/generate — Socratic question from page/selection.
Uses You.com Express (LLM) when available; falls back to template.
"""
from flask import Blueprint, request, jsonify

try:
    from services.concepts import extract_concepts
    from services.you_com import express_ask
except ImportError:
    from api.services.concepts import extract_concepts
    from api.services.you_com import express_ask

bp = Blueprint("question", __name__, url_prefix="/api/question")


def _safe_page_number(val, default=1):
    try:
        n = int(val) if val is not None else default
        return max(1, n)
    except (TypeError, ValueError):
        return default


def _fallback_question(selected_text: str) -> str:
    """Template-based question when You.com is unavailable or returns nothing."""
    if not selected_text or selected_text == "active learning":
        return "How would you summarize the main point of this section in one or two sentences?"
    snippet = selected_text[:80] + ("..." if len(selected_text) > 80 else "")
    return (
        f'What do you think the main idea of "{snippet}" is, '
        "and how would you explain it in your own words?"
    )


@bp.route("/generate", methods=["POST"])
def generate():
    """
    Body: { pdfId, pageNumber, selectedText }
    Returns: { question, concepts: [...], anchor: { pageNumber } }
    """
    try:
        data = request.get_json(silent=True) or {}
        page_number = _safe_page_number(data.get("pageNumber"), 1)
        selected_text = (data.get("selectedText") or "").strip() or "the current content"

        concepts = extract_concepts(selected_text)
        question = _fallback_question(selected_text)

        # Only call You.com when we have real passage content (not the generic fallback)
        is_generic = not selected_text or selected_text in ("active learning", "the current content")
        if is_generic:
            # No selection received (e.g. Foxit doesn't expose it). Ask for a varied question by page.
            prompt = (
                f"Generate exactly one short Socratic question for a student reading a textbook. "
                f"They are on page {page_number}. Vary the question type: sometimes ask to summarize, "
                "sometimes to connect to prior knowledge, sometimes to compare or apply, sometimes to question assumptions. "
                "Reply with only the question, no preamble or quotes."
            )
        else:
            prompt = (
                "Generate exactly one short Socratic question to help a student think deeper "
                "about this passage. Ask them to explain, compare, or reflect—do not give answers. "
                "Reply with only the question, no preamble or quotes.\n\nPassage:\n"
            ) + selected_text[:2000]

        you_answer = express_ask(prompt)
        if you_answer and len(you_answer.strip()) > 10:
            question = you_answer.strip()

        return jsonify({
            "question": question,
            "concepts": concepts,
            "anchor": {"pageNumber": page_number},
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
