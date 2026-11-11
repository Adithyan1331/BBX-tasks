
# Python OOP Assignment: Design a Class Hierarchy and Defend the Design

## Project Overview

This project demonstrates the four pillars of Object-Oriented Programming (OOP) in Python:

- Abstraction
- Encapsulation
- Inheritance
- Polymorphism

It also demonstrates custom exceptions, class methods, static methods, properties, special methods, mutable class attributes, and Method Resolution Order (MRO).

## Project Structure

oop-bank-assignment/
|
|-- bank.py
|-- part_b.py
|-- part_d.py
|-- README.md

---

# Part A - Banking System

## Description

The banking system contains an abstract base class called `Account` and two subclasses: `SavingsAccount` and `CurrentAccount`.

### Features

1. **Abstraction:** The `Account` class inherits from `abc.ABC` and defines the abstract method `calculate_interest()`.

2. **Encapsulation:** The balance is stored in the name-mangled attribute `__balance` and accessed through a read-only `@property`.

3. **Inheritance:** `SavingsAccount` and `CurrentAccount` inherit common functionality from `Account`.

4. **Polymorphism:** Each subclass implements `calculate_interest()` using its own interest rate.

5. **Custom Exception:** `InsufficientFundsError` is raised when a withdrawal exceeds the available balance.

6. **Class Method:** `from_dict(cls, data)` creates an account object from a dictionary.

7. **Static Method:** `validate_account_number(number)` validates account numbers containing 8 to 12 digits.

8. **Special Methods:** `__str__()` provides a readable description, while `__repr__()` provides a developer-oriented representation.

### Interest Calculation

Savings Account:
Interest = Balance * 4 / 100

Current Account:
Interest = Balance * 1 / 100

These rates are illustrative values used for this assignment.

### How to Run

```bash
python bank.py
```

---

# Part B - Class Attribute vs Instance Attribute

## Original Code

```python
class Dog:
    tricks = []

    def __init__(self, name):
        self.name = name


a = Dog("Rex")
b = Dog("Bo")

a.tricks.append("roll")
print(b.tricks)
```

### Prediction and Output

```text
['roll']
```

### Explanation

The `tricks` list is a class attribute shared by all `Dog` objects. Since lists are mutable, appending an item through `a.tricks` changes the same list accessed through `b.tricks`.

## Corrected Code

```python
class Dog:
    def __init__(self, name):
        self.name = name
        self.tricks = []


a = Dog("Rex")
b = Dog("Bo")

a.tricks.append("roll")

print(a.tricks)
print(b.tricks)
```

### Output

```text
['roll']
[]
```

### Explanation of the Fix

Initializing `tricks` inside `__init__` creates a separate list for each object. Therefore, changes to one dog's tricks do not affect another dog's tricks.

---

# Part C - Interview Questions

## 1. What is the difference between a class attribute and an instance attribute?

A class attribute belongs to the class itself and is shared by all instances unless an instance overrides it with an attribute of the same name. An instance attribute belongs to a particular object, so each object can have its own value. For example, in a `Dog` class, `species = "Canine"` can be a class attribute, while `self.name` is an instance attribute because every dog has a different name. Class attributes are useful for shared constants or common information, whereas instance attributes store individual object data. Mutable class attributes, such as lists, should be used carefully because changes are shared across instances.

## 2. When would you choose composition over inheritance?

I would choose composition when a class needs the functionality of another object without being a specialized type of that object. Composition represents a "has-a" relationship, whereas inheritance represents an "is-a" relationship. For example, a `Car` has an `Engine`, so I would create an `Engine` object inside the `Car` class instead of making `Car` inherit from `Engine`. Composition makes code more flexible because components can be replaced or reused independently. I prefer inheritance when subclasses genuinely share a common identity and behavior. In general, composition helps reduce tight coupling and can make large applications easier to maintain and test.

## 3. Is `__init__` a constructor?

Strictly speaking, `__init__` is an initializer, not the method that creates the object. Python's `__new__` method creates and returns the instance, while `__init__` initializes the newly created instance by setting its attributes or preparing its initial state. For example, in `def __init__(self, name)`, I can assign `self.name = name`. In everyday Python discussions, people often call `__init__` the constructor because it is the method commonly used to initialize objects. However, understanding the distinction between `__new__` and `__init__` is important, especially when working with immutable types, advanced inheritance, or custom object creation.

## 4. How does Python handle the diamond problem?

The diamond problem occurs when a class inherits from two classes that both inherit from the same base class. Python handles this using the Method Resolution Order, or MRO, which determines the order in which methods are searched. Python uses the C3 linearization algorithm to create a consistent order that respects the inheritance hierarchy and the declared order of parent classes. The `ClassName.__mro__` attribute shows this order, and `super()` follows it to continue method calls cooperatively through the hierarchy. This approach avoids simply calling the common base class twice when classes are designed to use cooperative multiple inheritance correctly.

---

# Part D - Multiple Inheritance and MRO

## Code

```python
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


print(D.__mro__)

obj = D()
obj.show()
```

## Expected MRO

```text
D -> B -> C -> A -> object
```

## Explanation

Python uses the C3 linearization algorithm to determine the Method Resolution Order. Since `D` inherits from `B` before `C`, Python searches `B` before `C`. Both classes inherit from `A`, which appears only once in the MRO. The `super()` function follows this order, allowing each class to call the next implementation cooperatively.

---

# Conclusion

This assignment demonstrates how Python OOP principles help organize code into reusable, maintainable, and structured components. The banking example uses abstraction, encapsulation, inheritance, and polymorphism, while the remaining parts explain mutable class attributes, object initialization, composition, and multiple inheritance.

## Technologies Used

- Python 3
- abc module
- Object-Oriented Programming
- Exception Handling
- Multiple Inheritance
