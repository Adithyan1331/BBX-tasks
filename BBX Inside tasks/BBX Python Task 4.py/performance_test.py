
# performance_test.py

import time

# Create a list containing 100,000 numbers.
my_list = list(range(100_000))

# Create a set containing the same numbers.
my_set = set(my_list)

target = 99999

# Measure list search time.
start = time.perf_counter()
result_list = target in my_list
list_time = time.perf_counter() - start

# Measure set search time.
start = time.perf_counter()
result_set = target in my_set
set_time = time.perf_counter() - start

# Display the results.
print("List result:", result_list)
print("Set result:", result_set)

print(f"List search time: {list_time:.9f} seconds")
print(f"Set search time:  {set_time:.9f} seconds")
