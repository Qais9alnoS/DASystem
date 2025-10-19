import os
import sys
import asyncio

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

def test_finance_endpoints(token):
    """Test the new finance endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test categories endpoint
    print("Testing /api/finance/categories endpoint...")
    response = client.get("/api/finance/categories", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Categories: {len(response.json())} items")
    else:
        print(f"Error: {response.json()}")
    
    # Test dashboard endpoint
    print("\nTesting /api/finance/dashboard endpoint...")
    response = client.get("/api/finance/dashboard", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Dashboard data keys: {list(data.keys())}")
    else:
        print(f"Error: {response.json()}")

if __name__ == "__main__":
    print("Creating test user...")
    create_test_user()
    
    print("Testing login...")
    login_response = test_login()
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        print("Login successful")
        test_finance_endpoints(token)
    else:
        print(f"Login failed: {login_response.json()}")