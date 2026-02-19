"""
Question enhancement logic: combines embeddings with existing prompts.
Modular wrapper that doesn't modify original question generation.
"""


def build_enhanced_prompt(
    original_prompt: str,
    pdf_context: str,
    is_generic: bool = False
) -> str:
    """
    Build enhanced prompt by adding PDF context to original.
    
    Args:
        original_prompt: The base prompt (from teammate's code)
        pdf_context: Context from embeddings
        is_generic: Whether this is a generic (no selection) prompt
    """
    if not pdf_context or not pdf_context.strip():
        return original_prompt
    
    # For generic prompts (no selection)
    if is_generic:
        # Insert context after first sentence
        sentences = original_prompt.split(". ", 1)
        if len(sentences) == 2:
            enhanced = (
                sentences[0] + ". "
                f"\n\nRELATED TEXTBOOK CONTENT:\n{pdf_context}\n\n"
                + sentences[1]
            )
            return enhanced
    
    # For specific passage prompts
    # Insert before "Reply with only the question"
    if "Reply with only the question" in original_prompt:
        parts = original_prompt.split("Reply with only the question", 1)
        enhanced = (
            parts[0] +
            f"\nBROADER PDF CONTEXT (use for depth, but focus on current passage):\n"
            f"{pdf_context}\n\n"
            "Reply with only the question" + parts[1]
        )
        return enhanced
    
    # Fallback: append at end
    return original_prompt + f"\n\nRELATED CONTENT:\n{pdf_context}\n"


def should_use_embeddings(pdf_id: str = None, selected_text: str = "") -> bool:
    """
    Determine if embeddings should be used for this request.
    
    Args:
        pdf_id: The PDF identifier
        selected_text: Selected text from page
    
    Returns:
        True if embeddings would add value
    """
    # Skip for very short selections (< 20 chars)
    if selected_text and len(selected_text.strip()) < 20:
        return False
    
    # Skip if no PDF ID provided
    if not pdf_id:
        return False
    
    return True
