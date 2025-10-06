from app.database import SessionLocal
from app.models.users import User

def check_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users in database: {len(users)}")
        for user in users:
            print(f"ID: {user.id}, Username: {user.username}, Role: {user.role}, Active: {user.is_active}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()