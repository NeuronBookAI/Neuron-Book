from .schema import QuestionState
from .prompts import SYSTEM_PROMPT
from .utils import get_sanity_client
from .sanity_embeddings import get_textbook_context  #Import embeddings
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash-exp")
sanity = get_sanity_client()

def fetch_page_node(state: QuestionState):
    """
    Fetches page content from Sanity AND gets broader PDF context via embeddings.
    O(1) fetch from Sanity + O(k) embeddings search
    """
    # Get the current page
    page = sanity.query(f'*[_id == "{state["page_id"]}"][0]')
    
    if not page:
        return {"page_content": "Content not found."}
    
    page_content = page.get('content', 'Content not found.')
    
    # Get broader context from embeddings
    # Create a query based on the page content or page number
    page_number = state.get('page_number', 1)
    query = f"page {page_number} key concepts and definitions"
    
    # Query embeddings for similar content across the entire PDF
    pdf_context = get_textbook_context(query, top_k=3)
    
    return {
        "page_content": page_content,
        "pdf_context": pdf_context
    }

def generate_question_node(state: QuestionState):
    """
    Generates a Socratic question using Gemini with BOTH current page and PDF context.
    """
    page_content = state.get('page_content', '')
    pdf_context = state.get('pdf_context', '')
    
    # Enhanced prompt that uses both local and broader context
    enhanced_prompt = f"""
{SYSTEM_PROMPT}

BROADER PDF CONTEXT (for background understanding):
{pdf_context}

CURRENT PAGE CONTENT (focus your question here):
{page_content}

Generate a Socratic question that:
1. Tests understanding of the CURRENT PAGE content
2. Uses the broader PDF context to ensure the question connects to larger themes
3. Challenges the student to think critically about the material
"""
    
    response = llm.invoke(enhanced_prompt)
    
    return {"socratic_question": response.content}

def commit_to_sanity_node(state: QuestionState):
    """
    Saves user's answer and confidence to Sanity.
    Database mutation (Write)
    """
    doc = sanity.create({
        '_type': 'userProgress',
        'pageRef': {'_ref': state['page_id']},
        'answer': state['user_answer'],
        'confidence': state['user_confidence']
    })
    
    print(f"Created document: {doc.get('_id', 'unknown')}")
    
    return state