##python
# basics_traps.py
# Predict, then verify: The basics traps

# 1. Floor division and modulo
print("1. Floor division and modulo:")
print(7 // 2, -7 // 2, 7 % 2, -7 % 2)

# 2. True division
print("\n2. True division:")
print(4 / 2, type(4 / 2))

# 3. Integer identity: 256
print("\n3. Integer identity (256):")
x = 256
y = 256
print(x is y)

# 4. Integer identity: 257
print("\n4. Integer identity (257):")
x = 257
y = 257
print(x is y)

# 5. Floating-point precision
print("\n5. Floating-point precision:")
print(0.1 + 0.2 == 0.3)

# 6. Boolean conversion
print("\n6. Boolean conversion:")
print(int(True) + int(True))

# 7. List equality and identity
print("\n7. List equality and identity:")
a = [1, 2]
b = [1, 2]
print(a == b, a is b)

# 8. Truthiness
print("\n8. Truthiness:")
print(bool(''), bool('0'), bool([]), bool([0]))

# 9. Convert decimal string to integer
print("\n9. String to integer:")
try:
    print(int('10.5'))
except ValueError as error:
    print(type(error).__name__, error)

# 10. Add a number to input
print("\n10. Input and integer addition:")
try:
    age = input("Age: ")
    print(age + 5)
except TypeError as error:
    print(type(error).__name__, error)

# Correct approach for question 10
print("\nCorrected approach:")
try:
    age = int(input("Enter age again: "))
    print(age + 5)
except ValueError:
    print("Please enter a valid integer.")
```