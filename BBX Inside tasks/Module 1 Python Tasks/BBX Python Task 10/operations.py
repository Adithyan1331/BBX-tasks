from models import Student


def add_student(students, student_id, name, marks):
    """Return a new student mapping with a validated, unique ID added."""
    student = Student(student_id, name, marks)
    if student.student_id in students:
        raise ValueError(f"Student ID {student.student_id!r} already exists.")
    updated = dict(students)
    updated[student.student_id] = student
    return updated


def list_students(students):
    """Return students in ID order without changing the mapping."""
    return [students[key] for key in sorted(students)]


def search_by_id(students, student_id):
    """Return the matching student, or None when the ID is not present."""
    return students.get(student_id.strip())


def search_by_name(students, name):
    """Return case-insensitive partial name matches in ID order."""
    query = name.strip().casefold()
    return [
        student
        for student in list_students(students)
        if query in student.name.casefold()
    ]


def update_student(students, student_id, *, name=None, marks=None):
    """Return a new mapping with the requested fields updated."""
    student_id = student_id.strip()
    if student_id not in students:
        raise KeyError(f"No student found with ID {student_id!r}.")

    current = students[student_id]
    updated_student = Student(
        student_id,
        current.name if name is None else name,
        current.marks if marks is None else marks,
    )
    updated = dict(students)
    updated[student_id] = updated_student
    return updated


def delete_student(students, student_id):
    """Return a new mapping without the requested student."""
    student_id = student_id.strip()
    if student_id not in students:
        raise KeyError(f"No student found with ID {student_id!r}.")
    updated = dict(students)
    del updated[student_id]
    return updated


def statistics(students):
    """Return aggregate marks and counts; 50 marks is the pass threshold."""
    marks = [student.marks for student in students.values()]
    if not marks:
        return {
            "total": 0,
            "average": None,
            "highest": None,
            "lowest": None,
            "passed": 0,
            "failed": 0,
        }

    passed = sum(mark >= 50 for mark in marks)
    return {
        "total": len(marks),
        "average": sum(marks) / len(marks),
        "highest": max(marks),
        "lowest": min(marks),
        "passed": passed,
        "failed": len(marks) - passed,
    }
