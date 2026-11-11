# Student Report

This package reads a CSV file containing a `score` column, ignores invalid scores, calculates descriptive statistics, and prints a report. Scores must be whole numbers from 0 through 100.

## Structure and responsibilities

- `src/student_report/loader.py` reads CSV rows only.
- `src/student_report/analysis.py` cleans score values and calculates statistics; its functions return values and never print.
- `src/student_report/formatting.py` turns calculated values into report text.
- `src/student_report/main.py` connects the pieces and prints the report.
- `tests/test_analysis.py` contains plain `assert` checks and needs no test framework.

The original rough, single-file script was split along these responsibilities and removed after the refactor.

## Install and run

From this directory, install the package in editable mode:

```shell
python -m pip install -e .
```

Provide a CSV with a `score` header, then run:

```shell
python -m student_report.main path\to\students.csv
```

If no path is supplied, the program reads `students.csv` from the current working directory. To run the checks after installation:

```shell
python tests/test_analysis.py
```

`requirements.txt` notes that only the Python standard library is needed at runtime.

## Imports

The package uses absolute imports such as `from student_report.analysis import clean_scores`. Absolute imports name the package from its importable root, making the dependency clear and consistent whether the entry point is executed with `python -m` or code is imported by tests. Relative imports depend on package context and can be less clear when modules are run in different ways. With the `src` layout, install the package (or add `src` to `sys.path`) so Python can locate `student_report`.

## Circular-import experiment

To reproduce a circular import, `loader.py` was temporarily changed to import `clean_scores` from `analysis.py`, while `analysis.py` imported `read_csv` from `loader.py`. Importing the loader then produced this exact exception message:

```text
ImportError: cannot import name 'read_csv' from partially initialized module 'student_report.loader' (most likely due to a circular import) (F:\Blackbox\BBX\BBX-tasks\BBX Inside tasks\Module 1 Python Tasks\BBX Python Task 8\src\student_report\loader.py)
```

The loader had not yet defined `read_csv` when analysis tried to import it, because loading the two modules recursively re-entered the still-initializing loader. The fix is to keep the loader and analysis independent: the loader only reads rows, and analysis only transforms and calculates values. `main.py` imports both and coordinates them. This one-way composition removes the cycle without hiding the dependency or delaying imports.

## Written answers

### 1. What does `if __name__ == '__main__'` do and why is it needed?

`if __name__ == "__main__":` is a conditional guard. Python sets a module's `__name__` to `"__main__"` when that file is executed as the program entry point; when imported, `__name__` is the module's importable name. Code indented beneath the guard therefore runs only during direct execution, not during import. This lets `main.py` define reusable functions without unexpectedly starting a report whenever another module or test imports it. It also provides a clear command-line entry point: `python -m student_report.main` executes the module as `__main__`, so its `main()` call runs exactly once. This keeps imports safe for automated tests and external callers as well.

### 2. How does Python decide where to find an imported module?

Python resolves an import by first checking whether the requested module is already present in `sys.modules`. If not, it asks finders on `sys.meta_path` to locate a module specification. For ordinary filesystem imports, the path-based finder searches directories in `sys.path`, in order; that list typically includes the script or current working directory, the standard library, installed site-packages, and paths added through environment settings. A package is identified by its directory and package files, while a module may be a `.py` file or another supported format. Install this src-layout project, or expose `src` on `sys.path`, before importing it. Import order matters here.
