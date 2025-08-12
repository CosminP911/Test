import sqlite3

conn = sqlite3.connect("requests.db")
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print("Tables:", cursor.fetchall())

# Example: view users
cursor.execute("SELECT * FROM users")
print("Users:", cursor.fetchall())

conn.close()
