import logging
import unittest
from unittest.mock import Mock, patch

import requests

from api_client import APIClient


def make_response(status_code, payload=None, *, links=None, headers=None):
    response = Mock(spec=requests.Response)
    response.status_code = status_code
    response.headers = headers or {}
    response.links = links or {}
    response.json.return_value = payload

    def raise_for_status():
        if status_code >= 400:
            raise requests.HTTPError(f"HTTP {status_code}")

    response.raise_for_status.side_effect = raise_for_status
    return response


class APIClientTests(unittest.TestCase):
    def setUp(self):
        self.client = APIClient(
            "https://api.example.test",
            max_attempts=4,
            backoff_factor=1,
            jitter=0.05,
        )

    def tearDown(self):
        self.client.close()

    @patch("api_client.os.getenv", return_value=None)
    def test_requires_github_token_when_requested(self, _getenv):
        with self.assertRaisesRegex(RuntimeError, "GITHUB_TOKEN is missing"):
            APIClient("https://api.example.test", require_api_key=True)

    @patch("api_client.time.sleep")
    @patch("api_client.random.uniform", return_value=0.025)
    def test_retries_rate_limit_and_server_error_with_increasing_delays(
        self, _random_uniform, sleep
    ):
        self.client.session.get = Mock(
            side_effect=[
                make_response(429),
                make_response(500),
                make_response(200, {"ok": True}),
            ]
        )

        with self.assertLogs("api_client", level="WARNING") as logs:
            response = self.client.get("/resource")

        delays = [call.args[0] for call in sleep.call_args_list]
        self.assertEqual(delays, [1.025, 2.025])
        self.assertLess(delays[0], delays[1])
        self.assertEqual(response.json(), {"ok": True})
        self.assertEqual(self.client.session.get.call_count, 3)
        self.assertIn("HTTP 429", logs.output[0])
        self.assertIn("HTTP 500", logs.output[1])

        print("Retry demonstration:")
        print("  HTTP statuses: 429 -> 500 -> 200")
        print(f"  Backoff intervals: {delays[0]:.3f}s -> {delays[1]:.3f}s")

    @patch("api_client.time.sleep")
    @patch("api_client.random.uniform", return_value=0)
    def test_raises_after_last_retry(self, _random_uniform, sleep):
        self.client.max_attempts = 2
        self.client.session.get = Mock(
            side_effect=[make_response(503), make_response(503)]
        )

        with self.assertRaises(requests.HTTPError):
            self.client.get("/unavailable")

        self.assertEqual(sleep.call_count, 1)
        self.assertEqual(self.client.session.get.call_count, 2)

    @patch("api_client.time.sleep")
    def test_honors_retry_after(self, sleep):
        self.client.session.get = Mock(
            side_effect=[
                make_response(429, headers={"Retry-After": "3"}),
                make_response(200, []),
            ]
        )

        self.client.get("/rate-limited")

        sleep.assert_called_once_with(3)

    def test_paginates_records_from_link_header(self):
        page_two = "https://api.example.test/items?page=2"
        self.client.session.get = Mock(
            side_effect=[
                make_response(
                    200,
                    [{"id": 1}, {"id": 2}],
                    links={"next": {"url": page_two}},
                ),
                make_response(200, [{"id": 3}]),
            ]
        )

        records = list(self.client.paginate("/items", params={"per_page": 2}))

        self.assertEqual(records, [{"id": 1}, {"id": 2}, {"id": 3}])
        self.assertEqual(self.client.session.get.call_count, 2)
        self.assertEqual(
            self.client.session.get.call_args_list[0].kwargs["params"],
            {"per_page": 2},
        )
        self.assertIsNone(self.client.session.get.call_args_list[1].kwargs["params"])


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    unittest.main(verbosity=2)
