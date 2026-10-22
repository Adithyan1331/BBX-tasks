
# part_a.py

import copy

a = [[1, 2], [3, 4]]

b = a
c = a[:]
d = copy.deepcopy(a)

# Modify an element in the original nested list
a[0][0] = 99

# Display the first element of each list
print(b[0][0], c[0][0], d[0][0])
