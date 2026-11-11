import csv
from pathlib import Path


def read_csv(path: str | Path) -> list[dict[str, str | None]]:
    """Read CSV rows without cleaning or analyzing their contents."""
    with Path(path).open(newline="", encoding="utf-8-sig") as csv_file:
        return list(csv.DictReader(csv_file))
