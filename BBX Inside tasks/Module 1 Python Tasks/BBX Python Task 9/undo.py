"""Safely demonstrate Git undo commands in temporary repositories."""

from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory


IDENTITY = ("Drill User", "drill@example.invalid")


def git(cwd: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=cwd,
        capture_output=True,
        check=False,
        text=True,
    )
    if result.returncode:
        raise RuntimeError(
            f"git {' '.join(args)} failed:\n{result.stdout}{result.stderr}"
        )
    output = result.stdout.strip()
    if output:
        print(output)
    return output


def configure(repo: Path) -> None:
    git(repo, "config", "user.name", IDENTITY[0])
    git(repo, "config", "user.email", IDENTITY[1])


def report_file(repo: Path) -> None:
    print(f"tracked.txt: {(repo / 'tracked.txt').read_text(encoding='utf-8').strip()}")


def demonstrate_resets(root: Path) -> None:
    repo = root / "reset-demo"
    repo.mkdir()
    git(repo, "init", "-b", "main")
    configure(repo)

    tracked_file = repo / "tracked.txt"
    tracked_file.write_text("original\n", encoding="utf-8")
    git(repo, "add", "tracked.txt")
    git(repo, "commit", "-m", "Add original file")

    tracked_file.write_text("change for soft reset\n", encoding="utf-8")
    git(repo, "add", "tracked.txt")
    git(repo, "commit", "-m", "Commit staged-reset example")
    print("\n1. git reset --soft HEAD~1")
    git(repo, "reset", "--soft", "HEAD~1")
    git(repo, "status", "--short")
    report_file(repo)

    git(repo, "commit", "-m", "Recreate soft-reset example")
    print("\n2. git reset --mixed HEAD~1")
    git(repo, "reset", "--mixed", "HEAD~1")
    git(repo, "status", "--short")
    report_file(repo)

    git(repo, "add", "tracked.txt")
    git(repo, "commit", "-m", "Recreate hard-reset example")
    print("\n3. git reset --hard HEAD~1")
    git(repo, "reset", "--hard", "HEAD~1")
    git(repo, "status", "--short")
    report_file(repo)


def demonstrate_pushed_revert(root: Path) -> None:
    remote = root / "remote.git"
    repo = root / "pushed-demo"
    repo.mkdir()
    git(root, "init", "--bare", str(remote))
    git(repo, "init", "-b", "main")
    configure(repo)

    tracked_file = repo / "tracked.txt"
    tracked_file.write_text("original\n", encoding="utf-8")
    git(repo, "add", "tracked.txt")
    git(repo, "commit", "-m", "Add original file")
    git(repo, "remote", "add", "origin", str(remote))
    git(repo, "push", "-u", "origin", "main")

    tracked_file.write_text("pushed change\n", encoding="utf-8")
    git(repo, "add", "tracked.txt")
    git(repo, "commit", "-m", "Commit pushed change")
    git(repo, "push")
    print("\n4. git revert --no-edit HEAD")
    git(repo, "revert", "--no-edit", "HEAD")
    report_file(repo)
    git(repo, "push")
    print("Remote history kept; the undo is a new commit.")


def main() -> None:
    with TemporaryDirectory(prefix="git-undo-drill-") as temporary_directory:
        root = Path(temporary_directory)
        demonstrate_resets(root)
        demonstrate_pushed_revert(root)


if __name__ == "__main__":
    main()