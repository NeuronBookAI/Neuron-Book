"""
Simple health / demo route.
"""
from flask import Blueprint

bp = Blueprint("health", __name__, url_prefix="/api")


@bp.route("/python")
def hello():
    return "<p>Hello, World!</p>"
