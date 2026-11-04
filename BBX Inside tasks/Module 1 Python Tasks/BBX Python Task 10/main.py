import operations
from models import Student
from storage import DataError, load_data, save_data


MENU = """
Student Management System
1. Add student
2. List students
3. Search by ID
4. Search by name
5. Update student
6. Delete student
7. Show statistics
0. Exit
"""


def _read_student_id():
    while True:
        student_id = input("Student ID: ")
        if student_id.strip():
            return student_id.strip()
        print("Student ID must not be empty.")


def _read_name():
    while True:
        name = input("Name: ")
        if name.strip():
            return name.strip()
        print("Name must not be empty.")


def _read_marks():
    while True:
        raw_marks = input("Marks (0-100): ")
        try:
            return Student("validation", "validation", float(raw_marks)).marks
        except ValueError as error:
            print(error)


def _show_student(student):
    print(student)


def _save_or_report(students):
    try:
        save_data(students)
    except OSError as error:
        print(f"Could not save data: {error}")
        return False
    return True


def _run_menu(students):
    while True:
        print(MENU)
        choice = input("Choose an option: ").strip()

        if choice == "0":
            print("Goodbye.")
            return students
        if choice == "1":
            student_id = _read_student_id()
            name = _read_name()
            marks = _read_marks()
            try:
                updated = operations.add_student(students, student_id, name, marks)
            except ValueError as error:
                print(error)
                continue
            if _save_or_report(updated):
                students = updated
                print("Student added.")
        elif choice == "2":
            if not students:
                print("No students to display.")
            else:
                for student in operations.list_students(students):
                    _show_student(student)
        elif choice == "3":
            student_id = input("Student ID to search: ").strip()
            student = operations.search_by_id(students, student_id)
            if student is None:
                print("Student not found.")
            else:
                _show_student(student)
        elif choice == "4":
            name = input("Name to search: ").strip()
            matches = operations.search_by_name(students, name)
            if not matches:
                print("No matching students found.")
            else:
                for student in matches:
                    _show_student(student)
        elif choice == "5":
            student_id = input("Student ID to update: ").strip()
            if student_id not in students:
                print(f"No student found with ID {student_id!r}.")
                continue
            current = students[student_id]
            name = input(f"Name [{current.name}] (Enter to keep): ")
            raw_marks = input(
                f"Marks [{current.marks:g}] (Enter to keep): "
            ).strip()
            try:
                marks = (
                    current.marks
                    if not raw_marks
                    else Student("validation", "validation", float(raw_marks)).marks
                )
                updated = operations.update_student(
                    students,
                    student_id,
                    name=current.name if not name.strip() else name,
                    marks=marks,
                )
            except (ValueError, KeyError) as error:
                print(error)
                continue
            if _save_or_report(updated):
                students = updated
                print("Student updated.")
        elif choice == "6":
            student_id = input("Student ID to delete: ").strip()
            try:
                updated = operations.delete_student(students, student_id)
            except KeyError as error:
                print(error.args[0])
                continue
            if _save_or_report(updated):
                students = updated
                print("Student deleted.")
        elif choice == "7":
            result = operations.statistics(students)
            print(f"Students: {result['total']}")
            if result["total"]:
                print(f"Average marks: {result['average']:.2f}")
                print(f"Highest marks: {result['highest']:g}")
                print(f"Lowest marks: {result['lowest']:g}")
            else:
                print("Average, highest and lowest marks: N/A")
            print(f"Pass: {result['passed']} | Fail: {result['failed']}")
        else:
            print("Invalid choice. Enter a number from 0 to 7.")


def main():
    try:
        students = load_data()
    except (DataError, OSError) as error:
        print(f"Could not load student data: {error}")
        return

    try:
        _run_menu(students)
    except (EOFError, KeyboardInterrupt):
        print("\nInput ended. Goodbye.")


if __name__ == "__main__":
    main()
