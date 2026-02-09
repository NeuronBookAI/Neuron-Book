"""
POST /api/question/generate — Socratic question from page/selection.
"""
from flask import Blueprint, request, jsonify

from services.concepts import extract_concepts

bp = Blueprint("question", __name__, url_prefix="/api/question")


@bp.route("/generate", methods=["POST"])
def generate():
    """
    Body: { pdfId, pageNumber, selectedText }
    Returns: { question, concepts: [...], anchor: { pageNumber } }
    """
    data = request.get_json() or {}
    page_number = int(data.get("pageNumber", 1))
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
