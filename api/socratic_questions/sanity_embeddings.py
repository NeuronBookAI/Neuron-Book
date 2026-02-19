import os
import requests
from typing import List, Dict, Any
from sanity import Client
import logging

logger = logging.getLogger(__name__)

SANITY_PROJECT_ID = os.getenv("SANITY_PROJECT_ID", "s7ui9lek")
SANITY_DATASET = os.getenv("SANITY_DATASET", "production")
SANITY_TOKEN = os.getenv("SANITY_WRITE_TOKEN")

# Initialize Sanity client
sanity_client = Client(
    logger,
    project_id=SANITY_PROJECT_ID,
    dataset=SANITY_DATASET,
    token=SANITY_TOKEN,
    use_cdn=False
)

def query_embeddings(
    query_text: str, 
    index_name: str = "textbook-pages", 
    top_k: int = 3
) -> List[Dict[str, Any]]:
    """Query Sanity embeddings index for semantically similar content."""
    
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/vX/embeddings-index/query/{SANITY_DATASET}/{index_name}"
    
    headers = {
        "Authorization": f"Bearer {SANITY_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "query": query_text,
        "k": top_k
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error querying embeddings: {e}")
        return []


def get_textbook_context(query: str, top_k: int = 3) -> str:
    """
    Get relevant context from textbook pages using semantic search.
    
    Args:
        query: The concept or question to search for
        top_k: Number of results to retrieve (default: 3)
        
    Returns:
        String containing relevant page content with page numbers
    """
    # Query embeddings
    results = query_embeddings(query, top_k=top_k)
    
    if not results:
        return "No relevant context found in textbooks."
    
    # Fetch actual page documents using the IDs
    context_parts = []
    for i, hit in enumerate(results, 1):
        doc_id = hit.get("value", {}).get("documentId")
        score = hit.get("score", 0)
        
        if not doc_id:
            continue
        
        # Fetch the page document from Sanity
        try:
            doc = sanity_client.query(
                f'*[_id == "{doc_id}"][0]{{'
                f'  title, pageNumber, content, '
                f'  "textbookTitle": textbook->title'
                f'}}'
            )
            
            if doc:
                result = doc.get("result", {})
                page_num = result.get("pageNumber", "?")
                textbook_title = result.get("textbookTitle", "Unknown")
                content = result.get("content", "")
                
                # Include a snippet of the actual content (first 300 chars)
                content_snippet = content[:300] + "..." if len(content) > 300 else content
                
                context_parts.append(
                    f"[Page {page_num} from '{textbook_title}' (relevance: {score:.2f})]\n"
                    f"{content_snippet}\n"
                )
        except Exception as e:
            logger.error(f"Error fetching page {doc_id}: {e}")
    
    if not context_parts:
        return "Could not retrieve textbook content."
    
    return "\n---\n".join(context_parts)