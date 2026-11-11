from collections.abc import Iterable, Sequence
from typing import TypedDict


class ScoreSummary(TypedDict):
    count: int
    average: float | None
    median: float | None
    highest: int | None
    lowest: int | None


def clean_scores(raw_scores: Iterable[str | None]) -> tuple[list[int], int]:
    """Return scores from 0 to 100 and the number of rejected values."""
    scores = []
    invalid_count = 0

    for raw_score in raw_scores:
        try:
            score = int(raw_score) if raw_score is not None else -1
        except ValueError:
            invalid_count += 1
            continue

        if 0 <= score <= 100:
            scores.append(score)
        else:
            invalid_count += 1

    return scores, invalid_count


def average(scores: Sequence[int]) -> float | None:
    """Return the arithmetic mean, or None when there are no scores."""
    return sum(scores) / len(scores) if scores else None


def median(scores: Sequence[int]) -> float | None:
    """Return the middle score, or None when there are no scores."""
    if not scores:
        return None

    ordered_scores = sorted(scores)
    middle = len(ordered_scores) // 2
    if len(ordered_scores) % 2:
        return float(ordered_scores[middle])
    return (ordered_scores[middle - 1] + ordered_scores[middle]) / 2


def summarize_scores(scores: Sequence[int]) -> ScoreSummary:
    """Calculate report statistics without producing output."""
    return {
        "count": len(scores),
        "average": average(scores),
        "median": median(scores),
        "highest": max(scores) if scores else None,
        "lowest": min(scores) if scores else None,
    }
