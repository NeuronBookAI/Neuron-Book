from socratic_questions import socratic_questions

# This simulates what your Figma buttons would send
test_state = {
    "page_id": "paste_a_real_sanity_id_here", 
    "user_answer": "Neurons use neurotransmitters to talk.",
    "user_confidence": "high"
}

print("--- Starting AI Loop ---")
result = socratic_questions.invoke(test_state)
print(f"AI Question: {result['socratic_question']}")
print("--- Check Sanity Studio for a new 'userProgress' entry! ---")