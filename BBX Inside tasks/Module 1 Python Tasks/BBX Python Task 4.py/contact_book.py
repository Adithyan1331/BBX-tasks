
# contact_book.py

# Phone numbers are keys and contact names are values.
contacts = {}


def add_contact(phone, name):
    """Add a contact or update an existing contact."""
    contacts[phone] = name
    print(f"Contact saved: {name} - {phone}")


def find_contact(phone):
    """Find a contact without raising KeyError."""
    # .get() returns None if the phone number is missing.
    name = contacts.get(phone)

    if name is None:
        print("Contact not found.")
        return None

    print(f"Name: {name}, Phone: {phone}")
    return name


def delete_contact(phone):
    """Delete a contact if it exists."""
    if phone in contacts:
        name = contacts.pop(phone)
        print(f"Deleted contact: {name}")
        return True

    print("Contact not found.")
    return False


def list_contacts():
    """Display all saved contacts."""
    if not contacts:
        print("Contact book is empty.")
        return

    for phone, name in contacts.items():
        print(f"Name: {name}, Phone: {phone}")


if __name__ == "__main__":
    # Add contacts
    add_contact("9876543210", "Rahul")
    add_contact("9123456780", "Varun")

    # Display all contacts
    print("\nAll contacts:")
    list_contacts()

    # Find an existing contact
    print("\nFind contact:")
    find_contact("9876543210")

    # Find a missing contact
    print("\nFind missing contact:")
    find_contact("9000000000")

    # Delete a contact
    print("\nDelete contact:")
    delete_contact("9123456780")

    # Display remaining contacts
    print("\nUpdated contact list:")
    list_contacts()
