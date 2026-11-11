import argparse
from pathlib import Path

from student_report.analysis import clean_scores, summarize_scores
from student_report.formatting import format_report
from student_report.loader import read_csv


def main() -> None:
    parser = argparse.ArgumentParser(description="Report statistics for student scores.")
    parser.add_argument(
        "csv_file",
        nargs="?",
        type=Path,
        default=Path("students.csv"),
        help="CSV file with a score column (default: students.csv)",
    )
    args = parser.parse_args()

    rows = read_csv(args.csv_file)
    scores, invalid_count = clean_scores(row.get("score") for row in rows)
    summary = summarize_scores(scores)
    print(format_report(summary, invalid_count))


if __name__ == "__main__":
    main()
