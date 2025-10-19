import sqlite3

# Connect to the database
conn = sqlite3.connect('app.db')
cursor = conn.cursor()

# Check subjects table structure
print("Subjects table columns:")
cursor.execute("PRAGMA table_info(subjects)")
columns = cursor.fetchall()
for col in columns:
    print(f"  {col}")

# Check if is_active column exists
has_is_active = any(col[1] == 'is_active' for col in columns)
print(f"\nHas is_active column: {has_is_active}")

# Close connection
conn.close()