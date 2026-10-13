
# part_d.py

# 1. LIST
# Choose a list for an ordered, changeable collection
# that allows duplicate values, such as student marks.
marks = [85, 90, 75, 90]
marks.append(95)

print("List:", marks)


# 2. TUPLE
# Choose a tuple for an ordered collection that should
# not be changed, such as fixed RGB color values.
rgb = (255, 0, 0)

print("Tuple:", rgb)


# 3. SET
# Choose a set for unique values and efficient membership
# testing, such as unique student IDs.
student_ids = {101, 102, 103, 101}

print("Set:", student_ids)
print("Is 102 present?", 102 in student_ids)


# 4. DICTIONARY
# Choose a dictionary to associate unique keys with values,
# such as phone numbers and contact names.
contacts = {
    "9876543210": "Rahul",
    "9123456780": "Varun"
}

print("Dictionary:", contacts)
print("Contact:", contacts.get("9876543210"))
