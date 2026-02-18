"""
POST /api/answer/submit — Evaluate answer and enrich concepts via You.com.
"""
from flask import Blueprint, request, jsonify

try:
    from services.concepts import extract_concepts
    from services.you_com import search as you_com_search
except ImportError:
    from api.services.concepts import extract_concepts
    from api.services.you_com import search as you_com_search

bp = Blueprint("answer", __name__, url_prefix="/api/answer")


@bp.route("/submit", methods=["POST"])
def submit():
    """
    Body: { pdfId, pageNumber, selectedText, question, answer, difficulty }
    Returns: { evaluation, concepts, enrichment?: [...] }
    """
    data = request.get_json() or {}
    answer = (data.get("answer") or "").strip()
    difficulty = data.get("difficulty", "medium")
    selected_text = (data.get("selectedText") or "").strip()

    concepts = extract_concepts(selected_text + " " + answer, limit=5)
    evaluation = (
        f"Your response was marked as '{difficulty}'. "
        "Keep reflecting on the concepts to strengthen your Neural Trace."
    )

    enrichment = []
    for concept in concepts[:3]:
        results = you_com_search(f"definition examples {concept}", count=3)
        summary_parts = []
        for r in results:
            if r.get("description"):
                summary_parts.append(r["description"][:200])
            for snip in (r.get("snippets") or [])[:1]:
                if snip:
                    summary_parts.append(snip[:200])
        summary = " ".join(summary_parts)[:500] if summary_parts else f"Concept: {concept}."
        enrichment.append({
            "concept": concept,
            "summary": summary,
            "definitions": [],
            "examples": [],
            "relatedConcepts": [],
        })

    return jsonify({
        "evaluation": evaluation,
        "concepts": concepts,
        "enrichment": enrichment,
    })
