from langgraph.graph import StateGraph, END
from .schema import QuestionState
from .nodes import fetch_page_node, generate_question_node, commit_to_sanity_node

builder = StateGraph(QuestionState)

builder.add_node("fetch_page", fetch_page_node)
builder.add_node("generate_question", generate_question_node)
builder.add_node("save_to_db", commit_to_sanity_node) # Add this!

builder.set_entry_point("fetch_page")
builder.add_edge("fetch_page", "generate_question")

# The graph will pause here until the frontend sends back the user_answer and confidence.
builder.add_edge("generate_question", "save_to_db")
builder.add_edge("save_to_db", END)

socratic_questions = builder.compile()