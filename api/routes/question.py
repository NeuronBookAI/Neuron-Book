"""
POST /api/question/generate — Socratic question from page/selection.
"""
from flask import Blueprint, request, jsonify

try:
    from services.concepts import extract_concepts
except ImportError:
    from api.services.concepts import extract_concepts

bp = Blueprint("question", __name__, url_prefix="/api/question")


def _safe_page_number(val, default=1):
    try:
        n = int(val) if val is not None else default
        return max(1, n)
    except (TypeError, ValueError):
        return default


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
        if not selected_text or selected_text == "active learning":
            question = "How would you summarize the main point of this section in one or two sentences?"
        else:
            snippet = selected_text[:80] + ("..." if len(selected_text) > 80 else "")
            question = (
                f'What do you think the main idea of "{snippet}" is, '
                "and how would you explain it in your own words?"
            )

        return jsonify({
            "question": question,
            "concepts": concepts,
            "anchor": {"pageNumber": page_number},
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
