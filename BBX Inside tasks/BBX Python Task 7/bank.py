
from abc import ABC, abstractmethod


class InsufficientFundsError(Exception):
    """Raised when an account has insufficient funds."""
    pass


class Account(ABC):
    """Abstract base class for bank accounts."""

    def __init__(self, account_number, holder_name, balance=0.0):
        if not self.validate_account_number(account_number):
            raise ValueError("Account number must contain 8-12 digits.")

        if balance < 0:
            raise ValueError("Initial balance cannot be negative.")

        self.account_number = str(account_number)
        self.holder_name = holder_name
        self.__balance = float(balance)

    @property
    def balance(self):
        """Read-only access to the account balance."""
        return self.__balance

    def deposit(self, amount):
        """Deposit a positive amount."""
        if amount <= 0:
            raise ValueError("Deposit amount must be positive.")

        self.__balance += amount
        return self.__balance

    def withdraw(self, amount):
        """Withdraw money if sufficient funds are available."""
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive.")

        if amount > self.__balance:
            raise InsufficientFundsError(
                "Insufficient funds for this withdrawal."
            )

        self.__balance -= amount
        return self.__balance

    @classmethod
    def from_dict(cls, data):
        """Create an account object from a dictionary."""
        return cls(
            account_number=data["account_number"],
            holder_name=data["holder_name"],
            balance=data.get("balance", 0.0),
        )

    @staticmethod
    def validate_account_number(number):
        """Check whether the account number has 8-12 digits."""
        number = str(number)
        return number.isdigit() and 8 <= len(number) <= 12

    @abstractmethod
    def calculate_interest(self):
        """Calculate interest according to the account type."""
        pass

    def __str__(self):
        return (
            f"{self.__class__.__name__} | "
            f"Account: {self.account_number} | "
            f"Holder: {self.holder_name} | "
            f"Balance: ₹{self.balance:.2f}"
        )

    def __repr__(self):
        return (
            f"{self.__class__.__name__}("
            f"account_number={self.account_number!r}, "
            f"holder_name={self.holder_name!r}, "
            f"balance={self.balance!r})"
        )


class SavingsAccount(Account):
    """Savings account with a 4% annual interest rate."""

    INTEREST_RATE = 0.04

    def calculate_interest(self):
        return self.balance * self.INTEREST_RATE


class CurrentAccount(Account):
    """Current account with a 1% annual interest rate."""

    INTEREST_RATE = 0.01

    def calculate_interest(self):
        return self.balance * self.INTEREST_RATE


if __name__ == "__main__":
    savings = SavingsAccount("12345678", "Rahul", 10000)
    current = CurrentAccount("87654321", "Anu", 20000)

    # Deposit and withdrawal
    savings.deposit(2000)
    savings.withdraw(1000)

    # Polymorphism: same method, different implementations
    for account in (savings, current):
        print(account)
        print("Interest:", account.calculate_interest())
        print("Representation:", repr(account))
        print()

    # Alternative constructor
    data = {
        "account_number": "11223344",
        "holder_name": "Arun",
        "balance": 5000,
    }
    new_account = SavingsAccount.from_dict(data)
    print("Created from dictionary:", new_account)

    # Static method
    print(
        "Valid account number:",
        Account.validate_account_number("12345678")
    )

    # Read-only balance
    try:
        savings.balance = 50000
    except AttributeError as error:
        print("Balance protection:", error)

    # Custom exception
    try:
        savings.withdraw(100000)
    except InsufficientFundsError as error:
        print("Withdrawal failed:", error)
