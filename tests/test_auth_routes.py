"""Tests covering the basic authentication flow."""

from app.models import User


def test_signup_creates_user_and_logs_in(client, app):
    """Signing up should create a user and log them in."""

    signup_data = {
        "username": "testuser",
        "email": "test@example.com",
        "display_name": "Test User",
        "password": "testpassword",
        "confirm_password": "testpassword",
    }

    response = client.post("/auth/signup", data=signup_data, follow_redirects=False)
    # Flask redirects to /builder on successful signup
    assert response.status_code in (302, 303)

    with app.app_context():
        assert User.query.filter_by(email="test@example.com").first() is not None

    # The user should now have access to the builder page
    builder_response = client.get("/builder")
    assert builder_response.status_code == 200


def test_login_after_logout(client):
    """A user should be able to login after logging out."""

    # First create a user via signup
    signup_data = {
        "username": "loginuser",
        "email": "login@example.com",
        "display_name": "Login User",
        "password": "securepass",
        "confirm_password": "securepass",
    }
    client.post("/auth/signup", data=signup_data, follow_redirects=False)

    # Logout the current user
    client.get("/auth/logout", follow_redirects=False)

    # Now login with the same credentials
    login_data = {
        "email": "login@example.com",
        "password": "securepass",
        "remember_me": "y",
    }
    login_response = client.post("/auth/login", data=login_data, follow_redirects=False)
    assert login_response.status_code in (302, 303)

    # After login the user should once again be able to access builder
    builder_response = client.get("/builder")
    assert builder_response.status_code == 200

