from flask import Blueprint, render_template
from flask_login import login_required, current_user

bp = Blueprint('main', __name__)

@bp.route('/')
def landing():
    return render_template('landing.html')

@bp.route('/builder')
def builder():
    return render_template('builder.html')

@bp.route('/notfound')
def not_found():
    return render_template('404.html'), 404
