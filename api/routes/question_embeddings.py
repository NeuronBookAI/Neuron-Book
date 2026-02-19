"""
ENHANCED question generation endpoint with Sanity embeddings.
Calls /api/question/generate and enhances it.

New endpoint: /api/question/enhanced
"""
from flask import Blueprint, request, jsonify
import requests

try:
    from services.embeddings_service import get_pdf_context
    from socratic_questions.question_enhancer import should_use_embeddings
except ImportError:
    from api.services.embeddings_service import get_pdf_context
    from api.socratic_questions.question_enhancer import should_use_embeddings

bp = Blueprint("question_embeddings", __name__, url_prefix="/api/question")


@bp.route("/enhanced", methods=["POST"])
def generate_enhanced():
    """
    Enhanced version: calls original /generate and adds embeddings context.
    Body: { pdfId, pageNumber, selectedText }
    """
    try:
        data = request.get_json(silent=True) or {}
        pdf_id = data.get("pdfId")
        page_number = data.get("pageNumber", 1)
        selected_text = data.get("selectedText", "").strip()

        # Get embeddings context
        use_embeddings = should_use_embeddings(pdf_id, selected_text)
        pdf_context_result = {"success": False, "context": "", "error": None}
        
        if use_embeddings:
            pdf_context_result = get_pdf_context(page_number, selected_text, top_k=3)

        original_response = requests.post(
            "http://localhost:5328/api/question/generate",
            json=data,
            timeout=30
        )
        
        if original_response.status_code != 200:
            return jsonify({"error": "Original endpoint failed"}), 500
        
        result = original_response.json()
        
        # Enhance with embeddings info
        result["embeddingsUsed"] = pdf_context_result["success"]
        if pdf_context_result["success"]:
            result["pdfContext"] = pdf_context_result["context"]
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
