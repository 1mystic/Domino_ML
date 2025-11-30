from flask import Blueprint, render_template, send_from_directory
from flask_login import login_required, current_user
import os

bp = Blueprint('main', __name__)

@bp.route('/')
def landing():
    return render_template('landing.html')

@bp.route('/builder')
def builder():
    return render_template('builder.html')

@bp.route('/presentation')
@bp.route('/presentation/<int:model_id>')
def presentation(model_id=None):
    return render_template('presentation.html', model_id=model_id)

@bp.route('/notfound')
def not_found():
    return render_template('404.html'), 404

@bp.route('/api-tester')
def api_tester():
    """Serve the API tester HTML page"""
    # Get the base directory (Domino_ML)
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    api_test_dir = os.path.join(base_dir, 'API-Test')
    return send_from_directory(api_test_dir, 'api-tester.html')
