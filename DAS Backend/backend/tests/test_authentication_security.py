import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.users import User
from app.utils.security import get_password_hash, verify_password
import uuid

def create_unique_username(base="test_user"):
    """Generate a unique username"""
    return f"{base}_{uuid.uuid4().hex[:8]}"

def test_password_hashing():
    """Test password hashing and verification"""
    password = "test_password_123"
    hashed = get_password_hash(password)
    
    # Verify the password matches
    assert verify_password(password, hashed) is True
    
    # Verify a wrong password doesn't match
    assert verify_password("wrong_password", hashed) is False

def test_login_endpoint(test_client, test_db: Session):
    """Test user login endpoint"""
    # Create a test user with unique username
    username = create_unique_username("test_user_login")
    user = User(
        username=username,
        password_hash=get_password_hash("test_password"),
        role="director",
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)  # Make sure the user is refreshed
    
    print(f"Created user: {username}")
    print(f"User ID after commit: {user.id}")
    
    # Verify user exists in database
    user_from_db = test_db.query(User).filter(User.username == username).first()
    print(f"User from DB query: {user_from_db}")
    if user_from_db:
        print(f"User from DB ID: {user_from_db.id}")
    
    # Test successful login
    response = test_client.post("/api/auth/login", json={
        "username": username,
        "password": "test_password"
    })
    
    print(f"Login response status: {response.status_code}")
    print(f"Login response data: {response.json()}")
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_with_invalid_credentials(test_client, test_db: Session):
    """Test login with invalid credentials"""
    # Create a test user with unique username
    username = create_unique_username("test_user_invalid")
    user = User(
        username=username,
        password_hash=get_password_hash("test_password"),
        role="director",
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    
    # Test login with wrong password
    response = test_client.post("/api/auth/login", json={
        "username": username,
        "password": "wrong_password"
    })
    
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "Incorrect username or password" in data["detail"]

def test_login_with_nonexistent_user(test_client):
    """Test login with nonexistent user"""
    # Use a definitely unique username that won't exist
    username = create_unique_username("nonexistent_user")
    response = test_client.post("/api/auth/login", json={
        "username": username,
        "password": "any_password"
    })
    
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "Incorrect username or password" in data["detail"]

def test_protected_endpoint_without_token(test_client):
    """Test accessing protected endpoint without token"""
    response = test_client.get("/api/students")
    
    # FastAPI HTTPBearer returns 403 when no token is provided
    assert response.status_code == 403

def test_protected_endpoint_with_valid_token(test_client, test_db: Session):
    """Test accessing protected endpoint with valid token"""
    # Create a test user with unique username
    username = create_unique_username("test_user_protected")
    user = User(
        username=username,
        password_hash=get_password_hash("test_password"),
        role="director",
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)  # Make sure the user is refreshed
    
    print(f"Created user for protected test: {username}")
    
    # Login to get token
    login_response = test_client.post("/api/auth/login", json={
        "username": username,
        "password": "test_password"
    })
    
    print(f"Login response status: {login_response.status_code}")
    print(f"Login response data: {login_response.json()}")
    
    assert login_response.status_code == 200
    data = login_response.json()
    assert "access_token" in data
    token = data["access_token"]
    
    # Access protected endpoint with token
    response = test_client.get("/api/students", headers={
        "Authorization": f"Bearer {token}"
    })
    
    # Should be successful (even if empty data)
    assert response.status_code == 200