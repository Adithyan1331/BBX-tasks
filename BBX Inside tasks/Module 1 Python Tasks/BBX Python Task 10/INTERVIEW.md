# Interview simulation

**1. What does your project do?**

It lets a user keep student names and marks in a small command-line register
that can be searched, edited, and reopened later.

**2. Walk me through the architecture and why you split it that way.**

`main.py` owns the interaction boundary: it displays the menu, asks questions,
and turns results into messages. It does not interpret JSON or implement the
business rules. `models.py` defines a `Student` and validates values through
properties, so invalid names and out-of-range marks cannot be assigned through
the public fields. `operations.py` is the application logic: it adds, searches,
updates, deletes, lists, and calculates statistics without printing or touching
files. `storage.py` is the only module allowed to read or write the JSON file.
That separation makes the logic testable without simulating terminal input or
depending on the real file. It also makes failures visible at the edges: the
menu reports load/save problems, and storage reports malformed data rather
than replacing it with an empty register.

**3. Why a dict keyed by ID rather than a list?**

An ID is unique and is the normal way to find an individual student. A
dictionary expresses that relationship directly and provides average O(1)
lookup by ID. With a list, each lookup would scan up to all records (O(n)), and
the application would need separate logic to prevent duplicates. A dictionary
also makes it straightforward to verify that a saved record's ID matches its
key. I still sort IDs when displaying students so output order is predictable.

**4. What was the hardest bug you hit, and how did you diagnose it?**

The most delicate issue was keeping the dictionary key and the student's ID
consistent during updates and reloads. If an ID changes in the object while
the dictionary remains keyed by the old value, searching, deleting, and saving
can disagree about which student is being addressed. I treated IDs as stable
identifiers in the update flow, recreated the updated student under the same
key, and made the loader reject a record whose embedded ID differs from its
key. I covered that boundary with operation and storage tests. This is a
specific implementation issue rather than a claim that the project has a
separate production incident history.

**5. What happens if data.json is corrupt?**

The JSON parser error is converted into a clear data error that includes the
line number. The CLI reports that it could not load student data and exits
without entering the menu or overwriting the file. Invalid record shapes,
invalid field values, and mismatched IDs are also rejected. That preserves the
original data for recovery instead of disguising corruption as an empty class.

**6. How would you scale this to 100,000 students?**

For 100,000 records, I would replace whole-file JSON persistence with SQLite.
I would create a students table with a primary-key ID and a numeric marks
column guarded by a range constraint, then use parameterized SQL for lookups,
updates, and deletes. An index on normalized names (or an appropriate search
index if substring search remains required) would support name queries. The
menu and domain validation could stay, while the storage interface would
become repository operations so the CLI would not load every row into memory
at startup. I would also add pagination to listing and use a migration/version
strategy for schema changes. The primary key would make uniqueness
authoritative even when multiple clients eventually write at once.

**7. What would you change with another week?**

I would replace the JSON store with SQLite behind a small repository interface,
then add migration tests and paginated listing. This is a concrete change to
the persistence and query path: it avoids rewriting the full dataset for each
edit, enforces unique IDs in the database, and provides a measured route to
larger classes. I would preserve the current JSON reader as a one-time import
path and test that a failed import leaves the existing database unchanged.
