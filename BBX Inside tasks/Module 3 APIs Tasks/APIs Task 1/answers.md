# Weather API exercise

## Run it

Install dependencies with `python -m pip install -r requirements.txt`, copy `.env.example` to `.env`, and set your OpenWeatherMap key as `OPENWEATHER_API_KEY=...` in `.env`. Run `python weather_cli.py London`. The request timeout defaults to 10 seconds; pass `--timeout 0.001` to exercise timeout handling. Never commit `.env`.

## Deliberate failure probes

- Wrong API key: OpenWeatherMap returned HTTP 401.
- Nonexistent city with the wrong key: OpenWeatherMap returned HTTP 401. Authentication failed before the city could be checked, so this probe does not establish the unauthenticated city-not-found status. A valid API key is required to verify the expected HTTP 404.
- `timeout=0.001`: the real request raised `requests.exceptions.ConnectTimeout` (a timeout exception).

## 1. Which HTTP methods are safe to retry, and why does it matter?

GET, HEAD, OPTIONS, and TRACE methods are defined as safe; GET and HEAD are commonly retried when a transient timeout or server failure occurs. Idempotent methods such as PUT and DELETE may also be retried because repeating them should leave the same intended resource state, although clients must consider whether the first response was lost after the change happened. POST is generally not safe to retry: repeating it can create duplicate orders or actions. Retry only transient failures, use bounded exponential backoff and jitter, and honor Retry-After. Correct retry behavior prevents duplicate side effects while improving resilience during temporary outages.

## 2. What is the difference between 401 and 403?

HTTP 401 Unauthorized means the request lacks valid authentication credentials: a key may be missing, malformed, expired, or invalid. The response commonly includes a WWW-Authenticate challenge, and the client should authenticate or correct credentials before retrying. HTTP 403 Forbidden means the server understood the authenticated request but refuses to authorize that action. The identity may be valid yet lack a needed role, scope, subscription, or resource permission. Repeating either request unchanged is unlikely to help; for 401, fix authentication, while for 403, request access or choose an allowed operation. APIs sometimes blur these conventions, so consult the specific API documentation.

## 3. Why must you always set a timeout?

Without an explicit timeout, a network request can wait indefinitely when a server stalls, a connection is half-open, or a network path disappears. A command-line program then appears frozen, consumes resources, and may prevent automation or shutdown from completing. A timeout bounds how long the client waits and lets it report a useful error, recover, or exit predictably. It should be selected for the service and operation rather than set absurdly low; connection and read timeouts may also be configured separately. Timeouts do not guarantee the server stopped processing, so retries still need idempotency awareness and bounded backoff when appropriate.
