# Git Conflict and History Drills

This project contains a real, resolved merge conflict and repeatable Git undo
and history-shape demonstrations. All scenario repositories created by the
Python demos live in temporary directories and are removed automatically.

Run from this directory:

```powershell
python .\app.py
python .\undo.py
python .\rebase-merge.py
```

`app.py` prints the greeting chosen when resolving Part A. The independent
repository in `conflict-drill\` preserves the actual Part A commit history.

## Part A — Conflict drill

In the throwaway repository, `main` and `feature-a` changed the same return
line in opposite ways. The merge command was `git merge feature-a`. Git
reported this exact output:

```text
Auto-merging app.py
CONFLICT (content): Merge conflict in app.py
Automatic merge failed; fix conflicts and then commit the result.
```

The conflicted block in `app.py` was:

```text
<<<<<<< HEAD
    return "Good day"
=======
    return "Hi there"
>>>>>>> feature-a
```

I kept the `main` version (`Good day`), removed the markers, staged `app.py`,
and committed the resolution. `git log --oneline --graph --all` then showed:

```text
*   57c3cc9 Resolve greeting merge conflict
|\  
| * e8c723f Change greeting on feature-a
* | 1e764ed Change greeting on main
|/  
* 4f9d7b1 Add greeting app
```

## Part B — Undo drill

The reset examples were run in an isolated temporary repository with a tracked
file named `tracked.txt`.

1. **Keep the changes staged:** `git reset --soft HEAD~1`. The branch moved
   back one commit, but the index and working-tree file stayed at the undone
   commit's contents. `git status --short` showed `M  tracked.txt` (staged).
2. **Keep the changes unstaged:** `git reset --mixed HEAD~1`. The branch and
   index moved back, while the working-tree file kept the change.
   `git status --short` showed ` M tracked.txt` (unstaged).
3. **Discard the commit and its tracked changes:** `git reset --hard HEAD~1`.
   The branch, index, and working tree moved back together; `tracked.txt`
   returned to `original` and the working tree was clean. This is destructive:
   only use it when the commit and its changes can safely be discarded.
4. **Undo a pushed commit without rewriting history:** `git revert --no-edit
   HEAD`, then `git push`. Revert made a new commit that restored the old file
   contents; the pushed commit stayed in history. The demo used a local bare
   remote to model a published branch.

## Part C — Rebase vs. merge

The demo created independent feature and `main` commits from a common base in
two isolated repositories. Captured `git log --oneline --graph` output:

<table>
<tr><th>Merge: git log --oneline --graph main</th><th>Rebase: git log --oneline --graph feature-rebase</th></tr>
<tr>
<td><pre>
*   9d8ad02 Merge feature
|\  
| * 68a3f5f Add feature work
* | 010ddc3 Add main work
|/  
* 7b6d66e Create common starting point
</pre></td>
<td><pre>
* 713b98e Add feature work
* 8a33c08 Add main work
* 7b6d66e Create common starting point
</pre></td>
</tr>
</table>

Merge preserves both original branch commits and adds a two-parent merge
commit, so the graph records where the branches joined. Rebase replays the
feature change on top of `main`, producing a linear graph without a merge
commit. The feature commit hash changed from
`68a3f5f7ec789e59302346f4c66a6fc1ff79dbc7` to
`713b98ec3dd2c7ea15a0e350d68fed5b66366a38`: a commit hash includes its parent,
so replaying the same change on a different parent creates a different commit.

## Part D — Written responses

### 1. When would you rebase and when would you merge?

I rebase a private feature branch when I want its commits replayed on the latest
base branch, usually to make a review easier to follow and keep the resulting
history linear. Rebasing rewrites commit identities, so I avoid rebasing commits
that teammates may already have based work on; coordinating a force-push does
not remove that disruption. I merge when integrating shared work, when branch
history is useful context, or when preserving the exact sequence and topology
matters. A merge commit records that two lines of work came together and does
not rewrite either side's commits. For a small private branch, rebase then
merge can be a reasonable team convention; for published/shared branches,
merge or another non-rewriting integration is generally safer. I follow the
repository's contribution policy and resolve conflicts carefully either way.

### 2. You have committed a password and pushed it. Walk me through what you do.

First, I treat the password as compromised: revoke or rotate it immediately,
then verify the replacement works and check provider audit logs for suspicious
use. I notify the repository owner or security contact and identify where the
secret appeared, including commits, branches, tags, build logs, artifacts, and
deployment configuration. I remove it from the current source, replace it with
a managed secret or environment-based configuration, and add an appropriate
secret-scanning/prevention check. If history must be rewritten to reduce
exposure, I coordinate with repository collaborators, rewrite affected refs
using the approved process, and have everyone resynchronize safely; rewriting
history does not make the old credential safe. I also request cleanup of
reachable caches or artifacts where possible, document the incident, and
confirm rotation and scanning are complete.

### 3. What is the staging area for?

The staging area, also called the index, is the proposed content of the next
commit. It lets me choose which changes to record instead of committing every
modified file in the working tree at once. For example, I can stage one
complete fix while leaving unrelated edits unstaged, or stage selected hunks
from a file to make a commit focused and reviewable. Before committing, I can
inspect the exact staged snapshot with `git diff --cached`; `git diff` by
itself shows unstaged changes. Staging also makes the commit boundary
intentional: the commit records what is in the index, not necessarily every
current file change. It is not a backup or a separate permanent history; I can
still revise staged content before committing. A deliberate staging step helps
keep commits coherent, understandable, and easier to revert or review.