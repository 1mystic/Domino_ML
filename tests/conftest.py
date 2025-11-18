import pytest

from app import create_app, db
from config import Config


class TestConfig(Config):
    """Configuration used for the test suite."""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False
    SECRET_KEY = "test-secret-key"


@pytest.fixture()
def app():
    """Create and configure a new app instance for each test."""

    app = create_app(TestConfig)

    with app.app_context():
        db.create_all()

    yield app

    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    """Return a Flask test client."""

    return app.test_client()


@pytest.fixture()
def runner(app):
    """Return a CLI runner for invoking Flask commands."""

    return app.test_cli_runner()

