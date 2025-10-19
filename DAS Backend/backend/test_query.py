import sqlite3
from app.config import settings
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Get the database path
db_path = settings.DATABASE_URL.replace("sqlite:///", "")
print(f"Database path: {db_path}")

# Create engine and session
engine = create_engine(settings.DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Try to execute the exact query that's failing
    print("\nExecuting query: SELECT count(*) AS count_1 FROM (SELECT subjects.class_id AS subjects_class_id, subjects.subject_name AS subjects_subject_name, subjects.weekly_hours AS subjects_weekly_hours, subjects.is_active AS subjects_is_active, subjects.id AS subjects_id, subjects.created_at AS subjects_created_at, subjects.updated_at AS subjects_updated_at FROM subjects) AS anon_1")
    
    result = db.execute(text("SELECT count(*) AS count_1 FROM (SELECT subjects.class_id AS subjects_class_id, subjects.subject_name AS subjects_subject_name, subjects.weekly_hours AS subjects_weekly_hours, subjects.is_active AS subjects_is_active, subjects.id AS subjects_id, subjects.created_at AS subjects_created_at, subjects.updated_at AS subjects_updated_at FROM subjects) AS anon_1"))
    
    count = result.scalar()
    print(f"Query successful, count: {count}")
    
except Exception as e:
    print(f"Query failed with error: {e}")
    print(f"Error type: {type(e)}")
    
    # Let's check what columns actually exist
    print("\nChecking actual columns in subjects table:")
    result = db.execute(text("PRAGMA table_info(subjects)"))
    columns = result.fetchall()
    for col in columns:
        print(f"  {col}")

finally:
    db.close()