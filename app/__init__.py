from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from flask_socketio import SocketIO
from config import Config

db = SQLAlchemy()
login_manager = LoginManager()
socketio = SocketIO()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for API endpoints
    CORS(app, resources={
        r"/api/*": {"origins": "*"},
        r"/auth/*": {"origins": "*"}
    }, supports_credentials=True)

    db.init_app(app)
    login_manager.init_app(app)
    # Initialize SocketIO
    socketio.init_app(app, async_mode='eventlet', cors_allowed_origins="*")

    # Register SocketIO Events
    with app.app_context():
        from app import socket_events

    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'

    # Register blueprints
    from app.routes import main, auth, api, lms
    app.register_blueprint(main.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(api.bp)
    app.register_blueprint(lms.bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    return app
