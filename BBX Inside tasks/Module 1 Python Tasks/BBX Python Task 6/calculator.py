class DivisionByZeroError(Exception):
    """Raised when attempting to divide by zero."""


def calculate(a, b, op):
    if op == "+":
        return a + b
    if op == "-":
        return a - b
    if op == "*":
        return a * b
    if op == "/":
        if b == 0:
            raise DivisionByZeroError("Cannot divide by zero.")
        return a / b
    raise ValueError(f"Unknown operator: {op!r}. Use one of +, -, *, /.")


def main():
    try:
        a = float(input("First number: "))
        b = float(input("Second number: "))
        op = input("Operator (+, -, *, /): ").strip()
        result = calculate(a, b, op)
    except ValueError as exc:
        print(f"Error: {exc}")
    except DivisionByZeroError as exc:
        print(f"Error: {exc}")
    else:
        print(f"Result: {result}")
    finally:
        print("Calculation attempted.")


if __name__ == "__main__":
    main()