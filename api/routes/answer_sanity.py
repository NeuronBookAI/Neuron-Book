"""
POST /api/answer/save-to-sanity — Save answer to Sanity Socratic schema
"""
from flask import Blueprint, request, jsonify
import os
import requests

bp = Blueprint("answer_sanity", __name__, url_prefix="/api/answer")

SANITY_PROJECT_ID = os.getenv("SANITY_PROJECT_ID", "s7ui9lek")
SANITY_DATASET = os.getenv("SANITY_DATASET", "production")
SANITY_TOKEN = os.getenv("SANITY_WRITE_TOKEN")


@bp.route("/save-to-sanity", methods=["POST"])
def save_to_sanity():
    """
    Body: {
        pdfId, pageNumber, selectedText, question, answer, 
        confidenceScore, pdfContext
    }
    Returns: { success, documentId }
    """
    data = request.get_json() or {}
    
    question = data.get("question", "")
    answer = data.get("answer", "")
    confidence = data.get("confidenceScore", 3)
    page_number = data.get("pageNumber", 1)
    selected_text = data.get("selectedText", "")
    pdf_context = data.get("pdfContext", "")
    
    # Get user ID from environment variable
    user_id = os.getenv("SANITY_DEFAULT_USER_ID")
    
    if not user_id:
        return jsonify({
            "success": False,
            "error": "SANITY_DEFAULT_USER_ID not set in environment"
        }), 500
    
    # Create title from page number and selected text
    title = f"Page {page_number}"
    if selected_text:
        title += f": {selected_text[:50]}"
    
    # Create Socratic document
    mutation = {
        "mutations": [
            {
                "create": {
                    "_type": "Socratic",
                    "user": {
                        "_type": "reference",
                        "_ref": user_id
                    },
                    "title": title,
                    "question": question,
                    "userResponse": answer,
                    "confidenceScore": confidence,
                    "feedback": f"Answered on page {page_number}"
                }
            }
        ]
    }
    
    try:
        url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/{SANITY_DATASET}"
        headers = {
            "Authorization": f"Bearer {SANITY_TOKEN}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=mutation, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        doc_id = result.get("results", [{}])[0].get("id")
        
        return jsonify({
            "success": True,
            "documentId": doc_id,
            "message": "Answer saved successfully"
        })
        
    except Exception as e:
        print(f"Error saving to Sanity: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
