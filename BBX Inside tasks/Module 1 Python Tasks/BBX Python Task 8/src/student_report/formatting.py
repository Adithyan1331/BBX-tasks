from student_report.analysis import ScoreSummary


def format_report(summary: ScoreSummary, invalid_count: int) -> str:
    """Format score statistics as a human-readable report."""
    average = (
        f"{summary['average']:.2f}"
        if summary["average"] is not None
        else "N/A"
    )
    median = (
        f"{summary['median']:.2f}"
        if summary["median"] is not None
        else "N/A"
    )
    highest = summary["highest"] if summary["highest"] is not None else "N/A"
    lowest = summary["lowest"] if summary["lowest"] is not None else "N/A"

    return "\n".join(
        [
            "Student Score Report",
            "--------------------",
            f"Valid scores: {summary['count']}",
            f"Invalid scores: {invalid_count}",
            f"Average: {average}",
            f"Median: {median}",
            f"Highest: {highest}",
            f"Lowest: {lowest}",
        ]
    )
