import unittest
from unittest.mock import Mock, patch

import requests

from weather_cli import WeatherError, fetch_weather


class FetchWeatherTests(unittest.TestCase):
    @patch("weather_cli.requests.get")
    def test_sends_query_parameters_and_timeout(self, get: Mock) -> None:
        response = get.return_value
        response.json.return_value = {"name": "London"}

        self.assertEqual(fetch_weather("London", "test-key", timeout=3), {"name": "London"})
        get.assert_called_once_with(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"q": "London", "appid": "test-key", "units": "metric"},
            timeout=3,
        )
        response.raise_for_status.assert_called_once()

    @patch("weather_cli.requests.get", side_effect=requests.exceptions.Timeout)
    def test_timeout_has_clear_message(self, _get: Mock) -> None:
        with self.assertRaisesRegex(WeatherError, "timed out"):
            fetch_weather("London", "test-key")

    @patch("weather_cli.requests.get", side_effect=requests.exceptions.ConnectionError)
    def test_connection_error_has_clear_message(self, _get: Mock) -> None:
        with self.assertRaisesRegex(WeatherError, "Could not connect"):
            fetch_weather("London", "test-key")

    def test_http_statuses_have_specific_messages(self) -> None:
        cases = {
            401: "Authentication failed",
            404: "City not found",
            429: "rate limit",
            503: "server error",
        }
        for status, expected in cases.items():
            with self.subTest(status=status):
                response = Mock()
                response.status_code = status
                http_error = requests.exceptions.HTTPError(response=response)
                response.raise_for_status.side_effect = http_error
                with patch("weather_cli.requests.get", return_value=response):
                    with self.assertRaisesRegex(WeatherError, expected):
                        fetch_weather("London", "test-key")


if __name__ == "__main__":
    unittest.main()
