from .schema import QuestionState
from .prompts import SYSTEM_PROMPT
from .utils import get_sanity_client
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
sanity = get_sanity_client()

def fetch_page_node(state: QuestionState):
    # O(1) fetch from Sanity
    page = sanity.query(f'*[_id == "{state["page_id"]}"][0]')
    return {"page_content": page.get('content', 'Content not found.')}

def generate_question_node(state: QuestionState):
    # Gemini generation
    full_prompt = SYSTEM_PROMPT.format(content=state['page_content'])
    response = llm.invoke(full_prompt)
    return {"socratic_question": response.content}

def commit_to_sanity_node(state: QuestionState):
    # Database mutation (Write)
    sanity.create({
        '_type': 'userProgress',
        'pageRef': {'_ref': state['page_id']},
        'answer': state['user_answer'],
        'confidence': state['user_confidence']
    })
    
    return state