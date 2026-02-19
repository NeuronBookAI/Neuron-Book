# Sanity DB Schema for sending and receiving data
from typing import TypedDict, Optional

class QuestionState(TypedDict):
    """
    State representing the current question-answer loop.
    Complexity: O(1) attribute access.
    """
    page_id: str
    page_number: Optional[int]  #For embeddings query
    textbook_id: Optional[str]  #identifying textbook
    page_content: Optional[str]  #getting current page text
    pdf_context: Optional[str]  #Broader context from embeddings
    user_answer: str
    user_confidence: str  
    socratic_question: str
    is_session_complete: bool