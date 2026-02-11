#Sanity DB Schema for sending and receiving data
from typing import TypedDict, Optional

class QuestionState(TypedDict):
    """
    State representing the current question-answer loop.
    Complexity: O(1) attribute access.
    """
    page_id: str
    user_answer: str
    user_confidence: str  
    socratic_question: str
    is_session_complete: bool