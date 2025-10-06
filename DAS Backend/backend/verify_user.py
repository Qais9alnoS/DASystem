from app.database import SessionLocal
from app.models.users import User
from app.utils.security import verify_password

def verify_user(username, password):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if user:
            print(f"User found: {user.username}")
            print(f"Role: {user.role}")
            print(f"Active: {user.is_active}")
            print(f"Password hash: {user.password_hash}")
            
            # Verify password
            if verify_password(password, user.password_hash):
                print("Password is correct!")
                return True
            else:
                print("Password is incorrect!")
                return False
        else:
            print(f"User '{username}' not found!")
            return False
    finally:
        db.close()

if __name__ == "__main__":
    print("Verifying director user...")
    verify_user("director", "director123")
    print("\nVerifying admin user...")
    verify_user("admin", "admin123")