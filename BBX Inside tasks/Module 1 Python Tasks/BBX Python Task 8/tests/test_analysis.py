from student_report.analysis import (
    average,
    clean_scores,
    median,
    summarize_scores,
)


assert average([2, 4]) == 3
assert clean_scores(["80", "bad", "101", None]) == ([80], 3)
assert median([10, 4, 8, 2]) == 6
assert summarize_scores([]) == {
    "count": 0,
    "average": None,
    "median": None,
    "highest": None,
    "lowest": None,
}
