# Calculator and Notes Project

A small Python project with two standalone scripts: a calculator and a timestamped notes app.

## Project structure

## Requirements

- Python 3.8 or newer. No third-party packages are needed.

## Running the calculator

```bash
python calculator.py
```

Enter two numbers and an operator (`+`, `-`, `*`, or `/`). Division by zero and unknown operators are reported as errors.

## Running the notes app

```bash
python notes_app.py
```

Choose `a` to add a note, `r` to read all notes, or `q` to quit. Notes are saved to `notes.txt` in the same folder, one per line with a timestamp.

## Notes

- `notes.txt` is created the first time you add a note. Add it to `.gitignore` if you use Git.
- Each script can also be imported, for example `from calculator import calculate`.