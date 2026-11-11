"""Fetch and display current weather from OpenWeatherMap."""

import argparse
import os
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

API_URL = "https://api.openweathermap.org/data/2.5/weather"
DEFAULT_TIMEOUT = 10.0


class WeatherError(Exception):
    """An expected, user-displayable weather request failure."""


def fetch_weather(city: str, api_key: str, timeout: float = DEFAULT_TIMEOUT) -> dict[str, Any]:
    """Fetch current weather, converting service and network failures to clear errors."""
    try:
        response = requests.get(
            API_URL,
            params={"q": city, "appid": api_key, "units": "metric"},
            timeout=timeout,
        )
        response.raise_for_status()
    except requests.exceptions.Timeout as exc:
        raise WeatherError("The weather request timed out. Please try again.") from exc
    except requests.exceptions.ConnectionError as exc:
        raise WeatherError("Could not connect to OpenWeatherMap. Check your internet connection.") from exc
    except requests.exceptions.HTTPError as exc:
        status = exc.response.status_code if exc.response is not None else None
        if status == 401:
            message = "Authentication failed (HTTP 401). Check your OpenWeatherMap API key."
        elif status == 404:
            message = f"City not found (HTTP 404): {city!r}."
        elif status == 429:
            message = "OpenWeatherMap rate limit reached (HTTP 429). Please wait and try again."
        elif status is not None and 500 <= status <= 599:
            message = f"OpenWeatherMap server error (HTTP {status}). Please try again later."
        else:
            message = f"Weather request failed with HTTP {status}."
        raise WeatherError(message) from exc
    except requests.exceptions.RequestException as exc:
        raise WeatherError(f"Weather request failed: {exc}") from exc

    try:
        data = response.json()
    except requests.exceptions.JSONDecodeError as exc:
        raise WeatherError("OpenWeatherMap returned an invalid response.") from exc
    if not isinstance(data, dict):
        raise WeatherError("OpenWeatherMap returned an unexpected response.")
    return data


def display_weather(data: dict[str, Any]) -> None:
    """Print the weather fields returned by the API."""
    try:
        city = data["name"]
        temperature = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        description = data["weather"][0]["description"]
    except (KeyError, IndexError, TypeError) as exc:
        raise WeatherError("OpenWeatherMap returned incomplete weather data.") from exc

    print(f"City: {city}")
    print(f"Temperature: {temperature} °C")
    print(f"Humidity: {humidity}%")
    print(f"Weather: {description}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Show current weather for a city.")
    parser.add_argument("city", help="city name (for example, London)")
    parser.add_argument(
        "--timeout",
        type=float,
        default=DEFAULT_TIMEOUT,
        help=f"request timeout in seconds (default: {DEFAULT_TIMEOUT:g})",
    )
    args = parser.parse_args(argv)
    if args.timeout <= 0:
        parser.error("--timeout must be greater than zero")

    load_dotenv(Path(__file__).with_name(".env"))
    api_key = os.getenv("OPENWEATHER_API_KEY", "").strip()
    if not api_key:
        print("Error: OPENWEATHER_API_KEY is missing. Add it to the .env file.")
        return 1

    try:
        display_weather(fetch_weather(args.city, api_key, args.timeout))
    except WeatherError as exc:
        print(f"Error: {exc}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
