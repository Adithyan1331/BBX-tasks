
# Part B - FizzBuzz

# Version 1: Using a for loop

print("Version 1: Using a for loop")

for number in range(1, 101):
    if number % 3 == 0 and number % 5 == 0:
        print("FizzBuzz")
    elif number % 3 == 0:
        print("Fizz")
    elif number % 5 == 0:
        print("Buzz")
    else:
        print(number)


# Version 2: Using a single list comprehension

print("\nVersion 2: Using a list comprehension")

result = [
    "FizzBuzz" if number % 15 == 0
    else "Fizz" if number % 3 == 0
    else "Buzz" if number % 5 == 0
    else number
    for number in range(1, 101)
]

print(*result, sep="\n")


# Explanation:
# range(1, 101) generates numbers from 1 to 100.
# % checks the remainder after division.
# Multiples of both 3 and 5 print FizzBuzz.
# Multiples of 3 print Fizz.
# Multiples of 5 print Buzz.
# Other numbers are printed unchanged.
#
# Readability:
# The normal for loop is easier to understand
# when the conditional logic becomes complicated.
