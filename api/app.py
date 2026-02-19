"""
Flask app factory: creates app and registers blueprints.
Run via: flask --app index run -p 5328  (index imports app from here)
"""
from flask import Flask
from routes.question_embeddings import bp as question_embeddings_bp

from config import CORS_ORIGINS
from routes.question import bp as question_bp
from routes.answer import bp as answer_bp
from routes.health import bp as health_bp

app = Flask(__name__)

try:
    from flask_cors import CORS
    CORS(app, origins=CORS_ORIGINS)
except ImportError:
    pass

app.register_blueprint(question_bp)
app.register_blueprint(answer_bp)
app.register_blueprint(health_bp)
app.register_blueprint(question_embeddings_bp)