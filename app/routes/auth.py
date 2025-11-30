from flask import Blueprint, render_template, redirect, url_for, flash, jsonify, request
from flask_login import login_user, logout_user, current_user
from app import db
from app.models import User
from app.forms import LoginForm, SignupForm

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.builder'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('main.builder'))
        flash('Invalid email or password', 'error')
    
    return render_template('auth.html', form=form)

@bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('main.builder'))
    
    form = SignupForm()
    if form.validate_on_submit():
        user = User(
            username=form.username.data,
            email=form.email.data,
            display_name=form.display_name.data or form.username.data,
            role=form.role.data
        )
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        login_user(user)
        flash('Account created successfully!', 'success')
        return redirect(url_for('main.builder'))
    
    return render_template('auth.html', form=form, signup=True)

@bp.route('/logout', methods=['GET', 'POST'])
def logout():
    logout_user()
    
    # Only return JSON for explicit API requests (not regular browser navigation)
    # Check for explicit API indicators:
    is_api_request = (
        request.headers.get('X-Requested-With') == 'XMLHttpRequest' or  # AJAX request
        (request.method == 'POST' and request.headers.get('Content-Type') == 'application/json') or  # POST with JSON
        (request.method == 'POST' and request.headers.get('Accept') == 'application/json')  # POST explicitly requesting JSON
    )
    
    if is_api_request:
        return jsonify({'message': 'Logged out successfully'}), 200
    
    # For regular web requests (GET from links, form submissions), always redirect
    flash('Logged out successfully!', 'success')
    return redirect(url_for('main.landing'))
