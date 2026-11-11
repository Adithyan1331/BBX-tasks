import string
def reverse_words(s):
    """Return the words of a string in reverse order."""
    return " ".join(s.split()[::-1])


def is_palindrome(s):
    """Check whether a string is a palindrome, ignoring case and punctuation."""
    cleaned = "".join(char.lower() for char in s if char.isalnum())
    return cleaned == cleaned[::-1]


def char_frequency(s):
    """Return character counts while ignoring whitespace."""
    frequency = {}
    for char in s:
        if not char.isspace():
            frequency[char] = frequency.get(char, 0) + 1
    return frequency


def is_anagram(a, b):
    """Check whether two strings are anagrams, ignoring case and spaces."""
    first = sorted(char.lower() for char in a if not char.isspace())
    second = sorted(char.lower() for char in b if not char.isspace())
    return first == second


def capitalise_names(s):
    """Capitalize each name while preserving multiple spaces."""
    return " ".join(
        word.capitalize() if word else ""
        for word in s.split(" ")
    )


def truncate(s, n):
    """Limit a string to n characters, adding dots if it is cut."""
    if n <= 0:
        return ""
    if len(s) <= n:
        return s
    if n <= 3:
        return "." * n
    return s[:n - 3] + "..."


def count_vowels(s):
    """Return the number of vowels in a string."""
    return sum(1 for char in s.lower() if char in "aeiou")


def longest_word(s):
    """Return the longest word in a sentence, or an empty string."""
    return max(s.split(), key=len, default="")


if __name__ == "__main__":
    print("1. reverse_words:")
    print(reverse_words("the sky is blue"))
    print("\n2. is_palindrome:")
    print(is_palindrome("A man, a plan, a canal: Panama"))
    print("\n3. char_frequency:")
    print(char_frequency("hello world"))
    print("\n4. is_anagram:")
    print(is_anagram("Listen", "Silent"))
    print("\n5. capitalise_names:")
    print(repr(capitalise_names("john  smith")))
    print("\n6. truncate:") 
    print(truncate("Python programming", 10))
    print("\n7. count_vowels:")
    print(count_vowels("Hello Python"))
    print("\n8. longest_word:")
    print(longest_word("Python is easy to learn"))