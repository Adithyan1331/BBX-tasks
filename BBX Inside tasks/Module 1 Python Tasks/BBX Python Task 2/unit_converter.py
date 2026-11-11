
# unit_converter.py
# Celsius to Fahrenheit converter

try:
    celsius = float(input("Enter temperature in Celsius: "))

    fahrenheit = (celsius * 9 / 5) + 32

    print(f"Temperature in Fahrenheit: {fahrenheit:.1f}°F")

except ValueError:
    print("Invalid input! Please enter a valid number.")
