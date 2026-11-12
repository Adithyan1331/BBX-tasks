
import logging

from api_client import APIClient


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


def test_retry(status_code):

    print("\n" + "=" * 40)
    print(f"Testing HTTP {status_code}")
    print("=" * 40)

    # httpbin does not require GitHub authentication
    client = APIClient(
        base_url="https://httpbin.org",
        timeout=10,
        max_attempts=5,
        require_api_key=False
    )

    try:
        client.get(f"/status/{status_code}")

    except Exception as error:
        print("Final result:", type(error).__name__)
        print("Retry test completed.")

    finally:
        client.close()


if __name__ == "__main__":

    test_retry(429)
    test_retry(500)
