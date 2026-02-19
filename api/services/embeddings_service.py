"""
Embeddings service: wraps Sanity embeddings with error handling.
Builds on top of socratic_questions module.
"""
import logging

try:
    from socratic_questions.sanity_embeddings import get_textbook_context
except ImportError:
    from api.socratic_questions.sanity_embeddings import get_textbook_context

logger = logging.getLogger(__name__)


def get_pdf_context(page_number: int, selected_text: str = "", top_k: int = 3) -> dict:
    """
    Get broader PDF context for a given page/text.
    
    Returns:
        {
            "success": bool,
            "context": str,
            "error": str | None
        }
    """
    try:
        # Build semantic query
        query_parts = [f"page {page_number}"]
        if selected_text and selected_text not in ("active learning", "the current content"):
            query_parts.append(selected_text[:200])
        
        query = " ".join(query_parts)
        
        # Query embeddings
        context = get_textbook_context(query, top_k=top_k)
        
        return {
            "success": True,
            "context": context,
            "error": None
        }
        
    except Exception as e:
        logger.error(f"Embeddings query failed: {e}")
        return {
            "success": False,
            "context": "",
            "error": str(e)
        }


def enhance_prompt_with_context(
    base_prompt: str,
    pdf_context: str,
    insert_position: str = "before_passage"
) -> str:
    """
    Enhance a prompt by intelligently inserting PDF context.
    
    Args:
        base_prompt: Original prompt text
        pdf_context: Context from embeddings
        insert_position: "before_passage" or "after_intro"
    """
    if not pdf_context:
        return base_prompt
    
    context_block = f"\n\nBROADER PDF CONTEXT (for reference):\n{pdf_context}\n\n"
    
    if insert_position == "after_intro":
        # Insert after first paragraph
        parts = base_prompt.split("\n\n", 1)
        if len(parts) == 2:
            return parts[0] + context_block + parts[1]
    
    # Default: insert before passage/instructions
    return base_prompt + context_block
