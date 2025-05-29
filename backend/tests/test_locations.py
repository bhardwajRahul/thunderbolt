"""Tests for locations API endpoint."""

import pytest
from fastapi.testclient import TestClient


class TestLocationsEndpoint:
    """Test locations search endpoint."""

    def test_locations_endpoint_missing_query(self, client: TestClient) -> None:
        """Test locations endpoint with missing query parameter."""
        response = client.get("/locations")
        assert response.status_code == 422
        assert "Field required" in response.json()["detail"][0]["msg"]

    def test_locations_endpoint_empty_query(self, client: TestClient) -> None:
        """Test locations endpoint with empty query parameter."""
        response = client.get("/locations?query=")
        # Empty query should either be treated as invalid or cause a 422
        assert response.status_code in [400, 422, 503]

    @pytest.mark.skipif(
        condition=True, reason="Integration test - requires valid WeatherAPI key"
    )
    def test_locations_endpoint_with_real_api(self, client: TestClient) -> None:
        """Test locations search endpoint with real API (when API key is configured)."""
        response = client.get("/locations?query=London")
        if response.status_code == 503:
            pytest.skip("Weather API key not configured")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]["name"] == "London"

    def test_locations_endpoint_responds_with_json(self, client: TestClient) -> None:
        """Test that locations endpoint returns JSON response."""
        response = client.get("/locations?query=London")
        # Should return JSON regardless of success/failure
        assert response.headers["content-type"].startswith("application/json")

    def test_locations_endpoint_invalid_query(self, client: TestClient) -> None:
        """Test locations endpoint with obviously invalid query."""
        response = client.get("/locations?query=InvalidLocation123XYZ987NonExistent")
        # Will either return empty list, 400 (invalid query) or 503 (no API key)
        assert response.status_code in [200, 400, 503]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)
            # Should return empty list for non-existent locations
            assert len(data) == 0

    def test_locations_endpoint_special_characters(self, client: TestClient) -> None:
        """Test locations endpoint with special characters in query."""
        response = client.get("/locations?query=São Paulo")
        # Should handle special characters gracefully
        assert response.status_code in [200, 400, 503]

    def test_locations_endpoint_numeric_query(self, client: TestClient) -> None:
        """Test locations endpoint with numeric query."""
        response = client.get("/locations?query=12345")
        # Should handle numeric queries gracefully
        assert response.status_code in [200, 400, 503]
