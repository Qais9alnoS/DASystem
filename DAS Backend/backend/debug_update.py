import sqlite3
import os
from app.config import settings

# Get the database path
db_path = settings.DATABASE_URL.replace("sqlite:///", "")
print(f"Database path: {db_path}")
print(f"Current working directory: {os.getcwd()}")

# Check if file exists
if os.path.exists(db_path):
    print(f"Database file exists: {os.path.getsize(db_path)} bytes")
else:
    print("Database file does not exist")

# Connect to the database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check subjects table structure before update
print("\nBefore update:")
cursor.execute("PRAGMA table_info(subjects)")
columns = cursor.fetchall()
for col in columns:
    print(f"  {col}")

# Check if is_active column exists
has_is_active = any(col[1] == 'is_active' for col in columns)
print(f"\nHas is_active column before update: {has_is_active}")

# Try to add the column if it doesn't exist
if not has_is_active:
    try:
        print("\nAdding is_active column...")
        cursor.execute("ALTER TABLE subjects ADD COLUMN is_active BOOLEAN DEFAULT 1")
        print("Successfully added is_active column")
    except Exception as e:
        print(f"Error adding is_active column: {e}")
else:
    print("\nColumn already exists, no need to add it")

# Check subjects table structure after update
print("\nAfter update:")
cursor.execute("PRAGMA table_info(subjects)")
columns = cursor.fetchall()
for col in columns:
    print(f"  {col}")

# Check if is_active column exists
has_is_active = any(col[1] == 'is_active' for col in columns)
print(f"\nHas is_active column after update: {has_is_active}")

# Commit and close
conn.commit()
conn.close()