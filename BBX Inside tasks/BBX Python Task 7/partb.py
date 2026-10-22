
class Dog:
    tricks = []

    def __init__(self, name):
        self.name = name


a = Dog("Rex")
b = Dog("Bo")

a.tricks.append("roll")

print(b.tricks)


class Dog:
    def __init__(self, name):
        self.name = name
        self.tricks = []


a = Dog("Rex")
b = Dog("Bo")

a.tricks.append("roll")

print(a.tricks)
print(b.tricks)
