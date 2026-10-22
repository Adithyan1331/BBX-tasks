
class A:
    def show(self):
        print("Class A")


class B(A):
    def show(self):
        print("Class B")
        super().show()


class C(A):
    def show(self):
        print("Class C")
        super().show()


class D(B, C):
    def show(self):
        print("Class D")
        super().show()


print("Method Resolution Order:")
print(D.__mro__)

print("\nMethod calls:")
obj = D()
obj.show()
