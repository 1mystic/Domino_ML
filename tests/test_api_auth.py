"""Tests focused on the API authentication behaviour."""


def test_api_models_requires_login(client):
    """
    The /api/models endpoint is protected by Flask-Login and should
    redirect anonymous users to the login page.
    """

    response = client.get("/api/models", follow_redirects=False)
    assert response.status_code in (302, 401)
    # Flask-Login uses a 302 redirect to /auth/login by default.
    if response.status_code == 302:
        assert "/auth/login" in response.headers.get("Location", "")


def test_templates_endpoint_available_without_login(client):
    """
    The templates endpoint does not require authentication and should
    respond with JSON even for anonymous users.
    """

    response = client.get("/api/templates")
    assert response.status_code == 200
    assert response.is_json

