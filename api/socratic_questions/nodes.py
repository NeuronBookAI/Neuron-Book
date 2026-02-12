from .schema import QuestionState
from .prompts import SYSTEM_PROMPT
from .utils import get_sanity_client
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
sanity = get_sanity_client()

def fetch_page_node(state: QuestionState):
    """
    Fetches page content from Sanity.
    O(1) fetch from Sanity
    """
    #get page number
    page = sanity.query(f'*[_id == "{state["page_id"]}"][0]')
    
    if not page:
        return {"page_content": "Content not found."}
    
    return {"page_content": page.get('content', 'Content not found.')}

def generate_question_node(state: QuestionState):
    """
    Generates a Socratic question using Gemini.
    """
    # Make sure page_content exists in state
    page_content = state.get('page_content', '')
    
    full_prompt = SYSTEM_PROMPT.format(content=page_content)
    response = llm.invoke(full_prompt)
    
    return {"socratic_question": response.content}

def commit_to_sanity_node(state: QuestionState):
    """
    Saves user's answer and confidence to Sanity.
    Database mutation (Write)
    """
    # This create syntax looks correct for Sanity
    doc = sanity.create({
        '_type': 'userProgress',
        'pageRef': {'_ref': state['page_id']},
        'answer': state['user_answer'],
        'confidence': state['user_confidence']
    })
    
    # Optional: return the created document ID for tracking
    print(f"Created document: {doc.get('_id', 'unknown')}")
    
    return state