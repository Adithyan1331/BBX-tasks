import logging
import os
import random
import time
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any, Iterator
from urllib.parse import urljoin

import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class APIClient:
    RETRY_STATUSES = {429, 500, 502, 503, 504}

    def __init__(
        self,
        base_url: str,
        require_api_key: bool = False,
        *,
        timeout: float = 10,
        max_attempts: int = 5,
        backoff_factor: float = 1,
        max_backoff: float = 30,
        jitter: float = 0.1,
    ) -> None:
        if max_attempts < 1:
            raise ValueError("max_attempts must be at least 1")
        if backoff_factor < 0 or max_backoff < 0 or jitter < 0:
            raise ValueError("backoff_factor, max_backoff, and jitter cannot be negative")

        self.base_url = base_url.rstrip("/") + "/"
        self.timeout = timeout
        self.max_attempts = max_attempts
        self.backoff_factor = backoff_factor
        self.max_backoff = max_backoff
        self.jitter = jitter

        self.github_token = os.getenv("GITHUB_TOKEN")
        if require_api_key and not self.github_token:
            raise RuntimeError("GITHUB_TOKEN is missing. Add it to your .env file.")

        self.session = requests.Session()
        if self.github_token:
            self.session.headers.update(
                {
                    "Authorization": f"Bearer {self.github_token}",
                    "Accept": "application/vnd.github+json",
                }
            )

    def _url(self, path: str) -> str:
        if path.startswith(("http://", "https://")):
            return path
        return urljoin(self.base_url, path.lstrip("/"))

    @staticmethod
    def _retry_after(response: requests.Response) -> float | None:
        value = response.headers.get("Retry-After")
        if not value:
            return None
        try:
            return max(0.0, float(value))
        except ValueError:
            try:
                retry_time = parsedate_to_datetime(value)
                if retry_time.tzinfo is None:
                    retry_time = retry_time.replace(tzinfo=timezone.utc)
                return max(0.0, (retry_time - datetime.now(timezone.utc)).total_seconds())
            except (TypeError, ValueError, OverflowError):
                logger.warning("Ignoring invalid Retry-After header: %s", value)
                return None

    def _backoff(self, retry_number: int, response: requests.Response | None = None) -> float:
        exponential = min(
            self.max_backoff,
            self.backoff_factor * (2 ** (retry_number - 1)),
        )
        delay = exponential + random.uniform(0, self.jitter)
        if response is not None:
            retry_after = self._retry_after(response)
            if retry_after is not None:
                delay = max(delay, retry_after)
        return delay

    def get(self, path: str, **kwargs: Any) -> requests.Response:
        url = self._url(path)
        kwargs.setdefault("timeout", self.timeout)

        for attempt in range(1, self.max_attempts + 1):
            try:
                response = self.session.get(url, **kwargs)
            except (requests.ConnectionError, requests.Timeout) as error:
                if attempt == self.max_attempts:
                    logger.error("GET %s failed after %d attempts: %s", url, attempt, error)
                    raise
                delay = self._backoff(attempt)
                logger.warning(
                    "GET %s failed (%s); retrying in %.2f seconds "
                    "(attempt %d/%d)",
                    url,
                    error,
                    delay,
                    attempt,
                    self.max_attempts,
                )
                time.sleep(delay)
                continue

            if response.status_code not in self.RETRY_STATUSES:
                response.raise_for_status()
                return response

            if attempt == self.max_attempts:
                response.raise_for_status()
                return response

            delay = self._backoff(attempt, response)
            logger.warning(
                "GET %s returned HTTP %d; retrying in %.2f seconds "
                "(attempt %d/%d)",
                url,
                response.status_code,
                delay,
                attempt,
                self.max_attempts,
            )
            response.close()
            time.sleep(delay)

        raise RuntimeError("GET retry loop exited unexpectedly")

    def paginate(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        items_key: str | None = None,
    ) -> Iterator[Any]:
        """Yield records from a paginated JSON endpoint using its Link header."""
        next_url: str | None = self._url(path)
        next_params = params

        while next_url:
            response = self.get(next_url, params=next_params)
            next_url = response.links.get("next", {}).get("url")
            next_params = None
            try:
                payload = response.json()
            finally:
                response.close()

            if items_key is not None:
                if not isinstance(payload, dict) or not isinstance(payload.get(items_key), list):
                    raise ValueError(f"Expected a list in the JSON field {items_key!r}")
                records = payload[items_key]
            elif isinstance(payload, list):
                records = payload
            else:
                raise ValueError("Expected a JSON list or set items_key for an object response")

            yield from records

    def close(self) -> None:
        self.session.close()

    def __enter__(self) -> "APIClient":
        return self

    def __exit__(self, exc_type: Any, exc_value: Any, traceback: Any) -> None:
        self.close()
