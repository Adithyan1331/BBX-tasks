"""Compare merge and rebase histories in isolated temporary repositories."""

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
    return result.stdout.strip()


def configure(repo: Path) -> None:
    git(repo, "config", "user.name", IDENTITY[0])
    git(repo, "config", "user.email", IDENTITY[1])


def create_template(root: Path) -> Path:
    repo = root / "template"
    repo.mkdir()
    git(repo, "init", "-b", "main")
    configure(repo)
    (repo / "base.txt").write_text("common starting point\n", encoding="utf-8")
    git(repo, "add", "base.txt")
    git(repo, "commit", "-m", "Create common starting point")
    return repo


def clone_scenario(template: Path, root: Path, name: str) -> Path:
    repo = root / name
    subprocess.run(
        ["git", "clone", "--quiet", "--local", str(template), str(repo)],
        check=True,
        capture_output=True,
        text=True,
    )
    configure(repo)
    return repo


def make_divergent_commits(repo: Path, feature_branch: str) -> None:
    git(repo, "switch", "-c", feature_branch)
    (repo / "feature.txt").write_text("feature work\n", encoding="utf-8")
    git(repo, "add", "feature.txt")
    git(repo, "commit", "-m", "Add feature work")

    git(repo, "switch", "main")
    (repo / "main.txt").write_text("main work\n", encoding="utf-8")
    git(repo, "add", "main.txt")
    git(repo, "commit", "-m", "Add main work")


def main() -> None:
    with TemporaryDirectory(prefix="git-history-drill-") as temporary_directory:
        root = Path(temporary_directory)
        template = create_template(root)

        merge_repo = clone_scenario(template, root, "merge-demo")
        make_divergent_commits(merge_repo, "feature-merge")
        git(merge_repo, "merge", "--no-ff", "feature-merge", "-m", "Merge feature")
        merge_graph = git(merge_repo, "log", "--oneline", "--graph", "main")

        rebase_repo = clone_scenario(template, root, "rebase-demo")
        make_divergent_commits(rebase_repo, "feature-rebase")
        old_feature_commit = git(rebase_repo, "rev-parse", "feature-rebase")
        git(rebase_repo, "switch", "feature-rebase")
        git(rebase_repo, "rebase", "main")
        new_feature_commit = git(rebase_repo, "rev-parse", "feature-rebase")
        rebase_graph = git(
            rebase_repo, "log", "--oneline", "--graph", "feature-rebase"
        )

        print("MERGE: git log --oneline --graph main")
        print(merge_graph)
        print("\nREBASE: git log --oneline --graph feature-rebase")
        print(rebase_graph)
        print(f"\nFeature commit before rebase: {old_feature_commit}")
        print(f"Feature commit after rebase:  {new_feature_commit}")


if __name__ == "__main__":
    main()