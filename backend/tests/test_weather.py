"""Tests for weather API endpoints."""

import pytest
from fastapi.testclient import TestClient


class TestWeatherEndpoints:
    """Test weather API endpoints."""

    def test_current_endpoint_missing_location(self, client: TestClient) -> None:
        """Test current weather endpoint with missing location parameter."""
        response = client.get("/weather/current")
        assert response.status_code == 422
        assert "Field required" in response.json()["detail"][0]["msg"]

    def test_forecast_endpoint_missing_location(self, client: TestClient) -> None:
        """Test forecast endpoint with missing location parameter."""
        response = client.get("/weather/forecast")
        assert response.status_code == 422
        assert "Field required" in response.json()["detail"][0]["msg"]

    def test_forecast_invalid_days_parameter(self, client: TestClient) -> None:
        """Test forecast endpoint with invalid days parameter."""
        response = client.get("/weather/forecast?location=London&days=15")
        # This will either work (if API key is configured) or return a 503
        # But the days validation should still trigger a 400 error
        assert response.status_code in [400, 503]
        if response.status_code == 400:
            assert (
                "Days parameter must be between 1 and 14" in response.json()["detail"]
            )

        response = client.get("/weather/forecast?location=London&days=0")
        assert response.status_code in [400, 503]
        if response.status_code == 400:
            assert (
                "Days parameter must be between 1 and 14" in response.json()["detail"]
            )

    @pytest.mark.skipif(
        condition=True, reason="Integration test - requires valid WeatherAPI key"
    )
    def test_current_endpoint_with_real_api(self, client: TestClient) -> None:
        """Test current weather endpoint with real API (when API key is configured)."""
        response = client.get("/weather/current?location=London")
        if response.status_code == 503:
            pytest.skip("Weather API key not configured")

        assert response.status_code == 200
        data = response.json()
        assert "location" in data
        assert "current" in data
        assert data["location"]["name"] == "London"

    @pytest.mark.skipif(
        condition=True, reason="Integration test - requires valid WeatherAPI key"
    )
    def test_forecast_endpoint_with_real_api(self, client: TestClient) -> None:
        """Test forecast endpoint with real API (when API key is configured)."""
        response = client.get("/weather/forecast?location=Tokyo&days=5")
        if response.status_code == 503:
            pytest.skip("Weather API key not configured")

        assert response.status_code == 200
        data = response.json()
        assert "location" in data
        assert "current" in data
        assert "forecast" in data
        assert data["location"]["name"] == "Tokyo"

    def test_current_endpoint_invalid_location(self, client: TestClient) -> None:
        """Test current weather endpoint with obviously invalid location."""
        response = client.get("/weather/current?location=InvalidLocation123XYZ")
        # Will either return 400 (invalid location) or 503 (no API key)
        assert response.status_code in [400, 503]

    def test_forecast_default_days_parameter(self, client: TestClient) -> None:
        """Test forecast endpoint uses default days parameter."""
        response = client.get("/weather/forecast?location=London")
        # Will either return success with default days or 503 (no API key)
        assert response.status_code in [200, 503]

    def test_weather_endpoints_respond_with_json(self, client: TestClient) -> None:
        """Test that weather endpoints return JSON responses."""
        endpoints = [
            "/weather/current?location=London",
            "/weather/forecast?location=London",
        ]

        for endpoint in endpoints:
            response = client.get(endpoint)
            # All endpoints should return JSON regardless of success/failure
            assert response.headers["content-type"].startswith("application/json")

    def test_current_endpoint_empty_location(self, client: TestClient) -> None:
        """Test current weather endpoint with empty location parameter."""
        response = client.get("/weather/current?location=")
        # Empty location should either be treated as invalid or cause a 422
        assert response.status_code in [400, 422, 503]

    def test_forecast_endpoint_empty_location(self, client: TestClient) -> None:
        """Test forecast endpoint with empty location parameter."""
        response = client.get("/weather/forecast?location=")
        # Empty location should either be treated as invalid or cause a 422
        assert response.status_code in [400, 422, 503]

    def test_forecast_endpoint_negative_days(self, client: TestClient) -> None:
        """Test forecast endpoint with negative days parameter."""
        response = client.get("/weather/forecast?location=London&days=-1")
        assert response.status_code in [400, 503]
        if response.status_code == 400:
            assert (
                "Days parameter must be between 1 and 14" in response.json()["detail"]
            )

    def test_forecast_endpoint_max_days_boundary(self, client: TestClient) -> None:
        """Test forecast endpoint with maximum allowed days."""
        response = client.get("/weather/forecast?location=London&days=14")
        # Should accept 14 days (the maximum)
        assert response.status_code in [200, 503]

    def test_forecast_endpoint_min_days_boundary(self, client: TestClient) -> None:
        """Test forecast endpoint with minimum allowed days."""
        response = client.get("/weather/forecast?location=London&days=1")
        # Should accept 1 day (the minimum)
        assert response.status_code in [200, 503]
