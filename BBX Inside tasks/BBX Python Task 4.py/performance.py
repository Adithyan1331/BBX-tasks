
import copy

a = [[1, 2], [3, 4]]

b = a
c = a[:]
d = copy.deepcopy(a)

a[0][0] = 99

print(b[0][0], c[0][0], d[0][0])
