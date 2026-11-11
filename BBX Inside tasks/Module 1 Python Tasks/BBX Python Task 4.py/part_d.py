
# part_d.py
# Part D - Choosing Data Structures


# 1. LIST
# Explanation: I choose a list when I need an ordered,
# mutable collection that allows duplicate values,
# such as a list of student marks.

marks = [85, 90, 75, 90]

marks.append(95)       # Add a mark
marks[0] = 88           # Update the first mark
marks.remove(75)        # Remove a mark

print("LIST")
print("Student marks:", marks)
print("First mark:", marks[0])
print("Number of marks:", len(marks))
print()


# 2. TUPLE
# Explanation: I choose a tuple when I need an ordered
# collection that should not be changed item by item,
# such as fixed RGB color values.

rgb_color = (255, 0, 0)

print("TUPLE")
print("RGB color:", rgb_color)
print("Red value:", rgb_color[0])
print("Number of values:", len(rgb_color))
print()


# 3. SET
# Explanation: I choose a set when I need unique values
# and efficient membership testing, such as unique
# student IDs.

student_ids = {101, 102, 103, 101}

student_ids.add(104)       # Add a new ID
student_ids.discard(103)   # Remove an ID if present

print("SET")
print("Unique student IDs:", student_ids)
print("Is 102 present?", 102 in student_ids)
print("Number of unique IDs:", len(student_ids))
print()


# 4. DICTIONARY
# Explanation: I choose a dictionary when I need to
# associate unique keys with values, such as storing
# contact names using phone numbers as keys.

contacts = {
    "9876543210": "Rahul",
    "9123456780": "Varun"
}

contacts["9000000001"] = "Arun"       # Add a contact
contacts["9876543210"] = "Rahul Kumar"  # Update a contact

print("DICTIONARY")
print("All contacts:", contacts)
print("Contact name:", contacts.get("9876543210"))
print("Missing contact:", contacts.get("9000000000"))
print("Number of contacts:", len(contacts))
