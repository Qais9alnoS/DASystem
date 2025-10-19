import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.database import get_db
from app.models.users import User
from app.utils.security import get_password_hash

# Create a test client
from fastapi.testclient import TestClient
client = TestClient(app)

def create_test_user():
    """Create a test finance user"""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        # Check if test user already exists
        user = db.query(User).filter(User.username == "test_finance").first()
        if not user:
            user_data = {
                "username": "test_finance",
                "password_hash": get_password_hash("test123"),
                "role": "finance",
                "is_active": True
            }
            user = User(**user_data)
            db.add(user)
            db.commit()
            db.refresh(user)
            print("Created test finance user")
        else:
            print("Test finance user already exists")
        return user
    finally:
        db.close()

def test_login():
    """Test user login"""
    response = client.post("/api/auth/login", json={
        "username": "test_finance",
        "password": "test123"
    })
    return response

if __name__ == "__main__":
    print("Creating test user...")
    create_test_user()
    
    print("Testing login...")
    login_response = test_login()
    print(f"Status code: {login_response.status_code}")
    print(f"Response: {login_response.json()}")