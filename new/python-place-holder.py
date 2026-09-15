
import requests

url = "https://jsonplaceholder.typicode.com/users"

response = requests.get(url)

print("Status Code:", response.status_code)
print("Response:", response.json())

if response.status_code == 200:
    users = response.json()

    for user in users:
        print("\nUser ID:", user["id"])
        print("Name:", user["name"])
        print("Username:", user["username"])
        print("Email:", user["email"])
        print("Phone:", user["phone"])
        print("Website:", user["website"])

else:
    print("Error:", response.status_code)