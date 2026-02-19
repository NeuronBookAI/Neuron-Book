import os
import hashlib
import requests
from flask import Blueprint, request, jsonify

bp = Blueprint("answer_sanity", __name__, url_prefix="/api/answer")

# Configuration from Environment
SANITY_PROJECT_ID = os.getenv("SANITY_PROJECT_ID", "s7ui9lek")
SANITY_DATASET = os.getenv("SANITY_DATASET", "production")
SANITY_TOKEN = os.getenv("SANITY_WRITE_TOKEN")


@bp.route("/save-to-sanity", methods=["POST"])
def save_to_sanity():
    """
    Expects JSON body:
    {
        "userId": "clerk_user_id_here",
        "pdfId": "textbook_123",
        "pageNumber": 5,
        "question": "What is Photosynthesis?",
        "answer": "It is how plants make food.",
        "confidenceScore": 5,
        "selectedText": "Plants use sunlight..."
    }
    """
    data = request.get_json() or {}

    # 1. Extract and Validate Required Data
    # 'userId' should be the _id of the user document in Sanity
    user_id = data.get("userId")
    pdf_id = data.get("pdfId", "unknown-pdf")
    page_number = data.get("pageNumber", 1)

    if not user_id:
        return jsonify(
            {
                "success": False,
                "error": "Missing 'userId' in request body. Ensure frontend passes the Sanity User ID.",
            }
        ), 400

    # 2. Generate a Deterministic ID
    # This prevents the 409 Conflict error. If the same user saves the same page
    # again, it will overwrite (update) the old entry instead of crashing.
    raw_id_string = f"{user_id}-{pdf_id}-{page_number}"
    hash_object = hashlib.md5(raw_id_string.encode())
    deterministic_id = f"socratic-{hash_object.hexdigest()}"

    # 3. Prepare metadata
    question = data.get("question", "No question provided")
    answer = data.get("answer", "")
    confidence = data.get("confidenceScore", 3)
    selected_text = data.get("selectedText", "")

    title = f"Page {page_number}"
    if selected_text:
        title += f": {selected_text[:50]}"

    # 4. Construct the Sanity Mutation
    # Use createIfNotExists + patch (upsert) instead of createOrReplace to
    # avoid 409 conflicts when concurrent requests target the same document.
    doc_fields = {
        "_type": "Socratic",
        "user": {"_type": "reference", "_ref": user_id, "_weak": True},
        "title": title,
        "question": question,
        "userResponse": answer,
        "confidenceScore": confidence,
        "feedback": f"Context: {selected_text[:100]}..."
        if selected_text
        else f"Answered on page {page_number}",
    }
    mutation = {
        "mutations": [
            {
                "createIfNotExists": {
                    "_id": deterministic_id,
                    **doc_fields,
                }
            },
            {
                "patch": {
                    "id": deterministic_id,
                    "set": {k: v for k, v in doc_fields.items() if k != "_type"},
                }
            },
        ]
    }

    # 5. Execute the Mutation
    try:
        url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/{SANITY_DATASET}"
        headers = {
            "Authorization": f"Bearer {SANITY_TOKEN}",
            "Content-Type": "application/json",
        }

        response = requests.post(url, json=mutation, headers=headers)
        print(f"Sanity response {response.status_code}: {response.text}")
        response.raise_for_status()

        return jsonify(
            {
                "success": True,
                "documentId": deterministic_id,
                "message": "Socratic entry saved/updated successfully",
            }
        )

    except requests.exceptions.HTTPError as http_err:
        print(f"Sanity API HTTP Error: {response.text}")
        return jsonify(
            {"success": False, "error": f"Sanity Error: {response.text}"}
        ), response.status_code
    except Exception as e:
        print(f"System Error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
