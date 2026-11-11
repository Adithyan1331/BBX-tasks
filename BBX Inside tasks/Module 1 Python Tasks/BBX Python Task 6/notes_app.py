from datetime import datetime

NOTES_FILE = "notes.txt"


def add_note(text):
    """Append a timestamped note as one line in the notes file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    single_line = text.replace("\n", " ").strip()
    with open(NOTES_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {single_line}\n")


def read_notes():
    """Stream the notes file line by line and print each note."""
    try:
        with open(NOTES_FILE, "r", encoding="utf-8") as f:
            found_any = False
            for line in f:
                found_any = True
                print(line.rstrip("\n"))
            if not found_any:
                print("The notes file is empty.")
    except FileNotFoundError:
        print("No notes yet. Add one first.")


def main():
    while True:
        choice = input("(a)dd, (r)ead, (q)uit: ").strip().lower()
        if choice == "a":
            text = input("Note: ")
            if text.strip():
                add_note(text)
                print("Saved.")
            else:
                print("Empty note not saved.")
        elif choice == "r":
            read_notes()
        elif choice == "q":
            break
        else:
            print("Unknown choice.")


if __name__ == "__main__":
    main()