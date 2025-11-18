"""Basic smoke tests for the public pages."""


def test_landing_page_renders(client):
    """The landing page should render successfully."""

    response = client.get("/")
    assert response.status_code == 200
    assert b"DominoML" in response.data


def test_builder_page_renders(client):
    """The builder page should render even for anonymous users."""

    response = client.get("/builder")
    assert response.status_code == 200
    # The builder page includes several references to ML components.
    assert b"Pipeline" in response.data or b"Builder" in response.data

