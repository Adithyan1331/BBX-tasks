
# performance_test.py

import time

# Step 1: Create a list of 100,000 numbers
my_list = list(range(100_000))

# Step 2: Create a set containing the same numbers
my_set = set(my_list)

# Step 3: Select the number to search for
target = 99999

# Step 4: Measure list membership time
start = time.perf_counter()
list_result = target in my_list
list_time = time.perf_counter() - start

# Step 5: Measure set membership time
start = time.perf_counter()
set_result = target in my_set
set_time = time.perf_counter() - start

# Step 6: Display the results
print("List search result:", list_result)
print("Set search result:", set_result)

print(f"List search time: {list_time:.9f} seconds")
print(f"Set search time:  {set_time:.9f} seconds")

# Step 7: Explain the time complexity
print("\nTime Complexity:")
print("List membership: O(n)")
print("Set membership: O(1) on average")

print(
    "\nExplanation: List membership may check every element, "
    "while set membership uses hash-based lookup, which is "
    "constant time on average."
)
