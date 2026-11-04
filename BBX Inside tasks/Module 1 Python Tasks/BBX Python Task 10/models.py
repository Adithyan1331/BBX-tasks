import math


class Student:
    def __init__(self, student_id, name, marks):
        self.student_id = student_id
        self.name = name
        self.marks = marks

    @property
    def student_id(self):
        return self._student_id

    @student_id.setter
    def student_id(self, value):
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Student ID must be a non-empty string.")
        self._student_id = value.strip()

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Name must not be empty.")
        self._name = value.strip()

    @property
    def marks(self):
        return self._marks

    @marks.setter
    def marks(self, value):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("Marks must be a number from 0 to 100.")
        if not 0 <= value <= 100 or not math.isfinite(value):
            raise ValueError("Marks must be a number from 0 to 100.")
        self._marks = value

    def __str__(self):
        return f"{self.student_id}: {self.name} — {self.marks:g} marks"

    def __repr__(self):
        return (
            f"Student(student_id={self.student_id!r}, "
            f"name={self.name!r}, marks={self.marks!r})"
        )
