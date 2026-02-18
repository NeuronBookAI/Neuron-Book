"""
ENHANCED POST /api/question/generate — Socratic question with embeddings context.
Uses You.com Express (LLM) + Sanity Embeddings for broader PDF context.
Falls back gracefully if embeddings unavailable.
"""
from flask import Blueprint, request, jsonify

try:
    from services.concepts import extract_concepts
    from services.you_com import express_ask
    from socratic_questions.sanity_embeddings import get_textbook_context
except ImportError:
    from api.services.concepts import extract_concepts
    from api.services.you_com import express_ask
    from api.socratic_questions.sanity_embeddings import get_textbook_context

bp = Blueprint("question_enhanced", __name__, url_prefix="/api/question")


def _safe_page_number(val, default=1):
    try:
        n = int(val) if val is not None else default
        return max(1, n)
    except (TypeError, ValueError):
        return default


def _fallback_question(selected_text: str) -> str:
    """Template-based question when You.com is unavailable."""
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
    Returns: { question, concepts: [...], anchor: { pageNumber }, pdfContext: [...] }
    
    ENHANCED: Now includes broader PDF context from embeddings!
    """
    try:
        data = request.get_json(silent=True) or {}
        pdf_id = data.get("pdfId")
        page_number = _safe_page_number(data.get("pageNumber"), 1)
        selected_text = (data.get("selectedText") or "").strip() or "the current content"

        # Extract concepts from current page
        concepts = extract_concepts(selected_text)
        
        # Get broader PDF context using embeddings
        pdf_context = ""
        try:
            # Query embeddings with page number and selected text
            query = f"page {page_number} {selected_text[:200]}"
            pdf_context = get_textbook_context(query, top_k=3)
        except Exception as e:
            print(f"Embeddings query failed (non-fatal): {e}")
            pdf_context = ""

        # Build enhanced prompt
        is_generic = not selected_text or selected_text in ("active learning", "the current content")
        
        if is_generic:
            # No selection - ask for varied question by page
            prompt = (
                f"Generate exactly one short Socratic question for a student reading a textbook. "
                f"They are on page {page_number}. "
            )
            if pdf_context:
                prompt += f"\n\nBROADER CONTEXT (use for background, but focus question on current page):\n{pdf_context}\n\n"
            prompt += (
                "Vary the question type: sometimes ask to summarize, "
                "sometimes to connect to prior knowledge, sometimes to compare or apply, "
                "sometimes to question assumptions. "
                "Reply with only the question, no preamble or quotes."
            )
        else:
            # Have specific passage - use embeddings context for depth
            prompt = (
                "Generate exactly one short Socratic question to help a student think deeper "
                "about this passage. Ask them to explain, compare, or reflect—do not give answers. "
            )
            if pdf_context:
                prompt += f"\n\nBROADER PDF CONTEXT (for reference):\n{pdf_context}\n\n"
            prompt += (
                "Focus your question on the CURRENT PASSAGE below, but use the broader context "
                "to make connections if relevant.\n\n"
                "Reply with only the question, no preamble or quotes.\n\n"
                "CURRENT PASSAGE:\n"
            ) + selected_text[:2000]

        # Call You.com Express
        you_answer = express_ask(prompt)
        question = you_answer.strip() if (you_answer and len(you_answer.strip()) > 10) else _fallback_question(selected_text)

        return jsonify({
            "question": question,
            "concepts": concepts,
            "anchor": {"pageNumber": page_number},
            "pdfContext": pdf_context,  # NEW: Return context for debugging
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
