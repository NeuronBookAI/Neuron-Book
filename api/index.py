from flask import Flask, request, jsonify
from flask_cors import CORS
from socratic_questions import socratic_questions # Imports the graph

app = Flask(__name__)
CORS(app) # Crucial: Allows Terminal 1 (port 3000) to talk to Terminal 2 (port 5328)

@app.route("/api/socratic", methods=["POST"])
def run_tutor():
    try:
        # 1. Get the data from your frontend
        data = request.json 
        
        # 2. Run the graph: Fetch -> Generate -> Save
        # This triggers nodes.py to talk to Gemini and Sanity
        result = socratic_questions.invoke(data)
        
        # 3. Return the AI question back to your component
        return jsonify({
            "question": result.get("socratic_question"),
            "status": "success"
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == '__main__':
    app.run(debug=True, port=5000)