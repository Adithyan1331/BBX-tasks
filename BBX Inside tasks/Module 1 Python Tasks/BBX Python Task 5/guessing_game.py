
import random

secret_number = random.randint(1, 100)

print("Welcome to the Number Guessing Game!")
print("Guess a number between 1 and 100.")
print("You have 7 attempts.")

for attempt in range(1, 8):

    # Validate user input
    while True:
        guess = input(
            f"Attempt {attempt}/7 - Enter your guess: "
        )

        if guess.isdigit():
            guess = int(guess)
            break
        else:
            print("Invalid input! Please enter a number.")


    if guess < secret_number:
        print("Higher")

    elif guess > secret_number:
        print("Lower")

    else:
        print("Congratulations! You guessed the number.")
        break


else:
    print(f"You lost! The number was {secret_number}.")
