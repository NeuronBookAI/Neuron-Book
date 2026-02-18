from flask import Flask, request, jsonify
from flask_cors import CORS

# Import your LangGraph
from socratic_questions import socratic_questions

# Import teammate's blueprints
from routes.question import bp as question_bp
from routes.answer import bp as answer_bp
from routes.health import bp as health_bp
from routes.question_embeddings import bp as question_embeddings_bp
from routes.answer_sanity import bp as answer_sanity_bp

app = Flask(__name__)
CORS(app)

# Register teammate's blueprints
app.register_blueprint(question_bp)
app.register_blueprint(answer_bp)
app.register_blueprint(health_bp)
app.register_blueprint(question_embeddings_bp)
app.register_blueprint(answer_sanity_bp)

# Your original route (keep for backward compatibility)
@app.route("/api/socratic", methods=["POST"])
def run_tutor():
    try:
        data = request.json 
        result = socratic_questions.invoke(data)
        
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
    app.run(debug=True, port=5328)