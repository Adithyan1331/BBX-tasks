# CLI Student Management System

A small, menu-driven application for maintaining student records, looking them
up by ID or name, and reviewing class marks. Records are saved in `data.json`
beside the Python files, so they are available the next time the program runs.

## Run

Requires Python 3.8 or newer and no third-party packages.

```powershell
python main.py
```

The program creates `data.json` the first time a student is saved. The file is
local application data and is intentionally ignored by Git.

## Usage example

```text
Student Management System
1. Add student
2. List students
3. Search by ID
4. Search by name
5. Update student
6. Delete student
7. Show statistics
0. Exit
Choose an option: 1
Student ID: ST-101
Name: Sam Rivera
Marks (0-100): 84
Student added.
```

Search by name is case-insensitive and matches part of a name. Updates keep the
existing ID; marks must be between 0 and 100. Statistics treat 50 or more as a
pass. With no students, the three marks summaries are shown as `N/A`.

## Architecture

- `main.py` owns the menu, prompts, and all user-facing output.
- `models.py` defines `Student`; its properties validate IDs, names, and marks.
- `operations.py` contains output-free functions for CRUD, search, and statistics.
  Functions return results rather than printing or accessing files.
- `storage.py` is the only module that reads or writes `data.json`. A missing
  file starts with an empty student dictionary; corrupt or invalid JSON is
  reported and is not overwritten.

Students are held in a dictionary keyed by their unique ID. This makes ID
lookups direct and naturally enforces the key-to-student relationship, rather
than requiring a list scan and separate duplicate checks for every lookup.

## Tests

```powershell
python -m unittest discover -s tests -v
```
