import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import operations
from models import Student
import storage
from storage import DataError


class StudentModelTests(unittest.TestCase):
    def test_properties_validate_and_normalize_values(self):
        student = Student("  S1  ", "  Ada  ", 99)
        self.assertEqual(student.student_id, "S1")
        self.assertEqual(student.name, "Ada")
        self.assertEqual(str(student), "S1: Ada — 99 marks")
        self.assertIn("Student(", repr(student))

    def test_invalid_values_are_rejected(self):
        for name in ("", "  "):
            with self.subTest(name=name), self.assertRaises(ValueError):
                Student("S1", name, 80)
        for marks in (
            -1,
            100.1,
            float("nan"),
            float("inf"),
            True,
            "80",
            10**10000,
        ):
            with self.subTest(marks=marks), self.assertRaises(ValueError):
                Student("S1", "Ada", marks)


class OperationsTests(unittest.TestCase):
    def setUp(self):
        self.students = operations.add_student({}, "S1", "Ada Lovelace", 90)
        self.students = operations.add_student(
            self.students, "S2", "Grace Hopper", 49
        )

    def test_add_and_search(self):
        with self.assertRaises(ValueError):
            operations.add_student(self.students, "S1", "Duplicate", 10)
        self.assertEqual(operations.search_by_id(self.students, " S1 ").name, "Ada Lovelace")
        self.assertEqual(
            [student.student_id for student in operations.search_by_name(self.students, "ADA")],
            ["S1"],
        )

    def test_update_and_delete_leave_input_mapping_unchanged(self):
        updated = operations.update_student(
            self.students, "S2", name="Grace", marks=50
        )
        self.assertEqual(self.students["S2"].name, "Grace Hopper")
        self.assertEqual(updated["S2"].marks, 50)
        deleted = operations.delete_student(updated, "S1")
        self.assertIn("S1", updated)
        self.assertNotIn("S1", deleted)

    def test_statistics_and_empty_statistics(self):
        result = operations.statistics(self.students)
        self.assertEqual(result["average"], 69.5)
        self.assertEqual((result["highest"], result["lowest"]), (90, 49))
        self.assertEqual((result["passed"], result["failed"]), (1, 1))
        self.assertIsNone(operations.statistics({})["average"])


class StorageTests(unittest.TestCase):
    def test_missing_file_and_round_trip(self):
        with tempfile.TemporaryDirectory() as directory:
            data_file = Path(directory) / "data.json"
            with patch.object(storage, "DATA_FILE", data_file):
                self.assertEqual(storage.load_data(), {})
                students = operations.add_student({}, "S1", "Ada", 87.5)
                storage.save_data(students)
                self.assertEqual(storage.load_data()["S1"].marks, 87.5)

    def test_corrupt_json_is_reported_without_replacement(self):
        with tempfile.TemporaryDirectory() as directory:
            data_file = Path(directory) / "data.json"
            data_file.write_text("{", encoding="utf-8")
            with patch.object(storage, "DATA_FILE", data_file):
                with self.assertRaises(DataError):
                    storage.load_data()
            self.assertEqual(data_file.read_text(encoding="utf-8"), "{")

    def test_non_utf8_file_is_reported(self):
        with tempfile.TemporaryDirectory() as directory:
            data_file = Path(directory) / "data.json"
            data_file.write_bytes(b"\xff")
            with patch.object(storage, "DATA_FILE", data_file):
                with self.assertRaises(DataError):
                    storage.load_data()

    def test_invalid_record_is_reported(self):
        with tempfile.TemporaryDirectory() as directory:
            data_file = Path(directory) / "data.json"
            data_file.write_text(
                json.dumps(
                    {"S1": {"student_id": "S1", "name": "Ada", "marks": 101}}
                ),
                encoding="utf-8",
            )
            with patch.object(storage, "DATA_FILE", data_file):
                with self.assertRaises(DataError):
                    storage.load_data()


if __name__ == "__main__":
    unittest.main()
