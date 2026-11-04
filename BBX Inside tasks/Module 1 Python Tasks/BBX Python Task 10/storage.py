import json
from pathlib import Path

from models import Student


DATA_FILE = Path(__file__).with_name("data.json")


class DataError(ValueError):
    """Raised when the saved student data cannot be read safely."""


def load_data():
    """Load students keyed by ID; a missing data file means an empty class."""
    try:
        raw_data = DATA_FILE.read_text(encoding="utf-8")
    except FileNotFoundError:
        return {}
    except UnicodeDecodeError as error:
        raise DataError("The data file is not valid UTF-8 text.") from error

    try:
        records = json.loads(raw_data)
    except json.JSONDecodeError as error:
        raise DataError(f"Invalid JSON: {error.msg} (line {error.lineno}).") from error
    except (ValueError, RecursionError) as error:
        raise DataError(f"Invalid JSON data: {error}.") from error

    if not isinstance(records, dict):
        raise DataError("The data file must contain a JSON object keyed by student ID.")

    students = {}
    for student_id, record in records.items():
        if not isinstance(student_id, str) or not isinstance(record, dict):
            raise DataError("Each student record must be an object keyed by a string ID.")
        if set(record) != {"student_id", "name", "marks"}:
            raise DataError(f"Student {student_id!r} has an invalid record shape.")
        try:
            student = Student(
                record["student_id"],
                record["name"],
                record["marks"],
            )
        except (TypeError, ValueError) as error:
            raise DataError(f"Invalid record for student {student_id!r}: {error}") from error
        if student.student_id != student_id:
            raise DataError(f"Student ID mismatch for record {student_id!r}.")
        students[student_id] = student

    return students


def save_data(students):
    """Persist students keyed by ID as readable JSON."""
    records = {
        student_id: {
            "student_id": student.student_id,
            "name": student.name,
            "marks": student.marks,
        }
        for student_id, student in students.items()
    }
    DATA_FILE.write_text(
        json.dumps(records, indent=2, ensure_ascii=False, allow_nan=False) + "\n",
        encoding="utf-8",
    )
