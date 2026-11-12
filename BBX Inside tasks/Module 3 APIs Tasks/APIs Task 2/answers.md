# API Client Exercise

## Run it

Install the dependencies with `python -m pip install -r requirements.txt`, then run `python test_api.py`. The tests use mocked responses, so the retry and pagination demonstrations are repeatable and do not require a live API or a real GitHub token. The client loads `GITHUB_TOKEN` from the environment or a local `.env` file when needed. Never commit `.env`.

## 1. How should an API client handle rate limiting?

When an API responds with HTTP 429 Too Many Requests, the client should stop sending requests for a while rather than immediately retrying. It should honor the server's `Retry-After` header when present; otherwise, use bounded exponential backoff so the wait increases after each failed attempt. Retries must be limited, and non-transient errors should be reported instead of retried. The client should also avoid exceeding the API's documented quota by controlling its request rate.

## 2. What is jitter, and why is it useful?

Jitter is a small random variation added to a retry delay. Without it, many clients that fail at the same time may retry at the same exponential intervals, causing synchronized bursts that keep an overloaded service busy. Randomizing the delay spreads those retries over time and reduces the chance of a repeated traffic spike.

## 3. Is it safe to retry POST requests?

Usually not by default. A POST may create a resource or trigger an action, so retrying after a timeout could duplicate work if the server processed the first request but its response was lost. A POST is safer to retry only when the API supports idempotency keys or another mechanism that ensures repeated submissions have one effect, or when the caller can otherwise confirm the first attempt did not take effect. GET requests are generally safe to retry; retries should still be bounded and limited to transient failures.
