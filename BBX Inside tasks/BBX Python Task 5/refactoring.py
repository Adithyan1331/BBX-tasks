
# Part A - Rewrite It Pythonically, Then Explain Why

# 1. Direct iteration
print("1. Direct Iteration")

names = ["Arun", "Rahul", "Varun"]

for name in names:
    print(name)

# Explanation:
# Direct iteration avoids unnecessary indexing.


# 2. List comprehension
print("\n2. Square of Even Numbers")

numbers = [1, 2, 3, 4, 5, 6]

result = [x * x for x in numbers if x % 2 == 0]

print(result)

# Explanation:
# List comprehension filters even numbers and squares them.


# 3. Searching using for/else
print("\n3. Search Using for/else")

items = [10, 20, 30, 40]
target = 30

for item in items:
    if item == target:
        print("Found")
        break
else:
    print("Not found")

# Explanation:
# The else block runs if the loop finishes without break.


# 4. Check whether a list is empty
print("\n4. Check List")

my_list = [10, 20, 30]

if my_list:
    print("List is not empty")

# Explanation:
# A non-empty list evaluates to True.


# 5. Iterate through two lists using zip()
print("\n5. Using zip()")

a = [1, 2, 3]
b = ["A", "B", "C"]

for x, y in zip(a, b):
    print(x, y)

# Explanation:
# zip() pairs corresponding elements from both lists.
