import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.academic import AcademicYear
from app.models.director import DirectorNote, Reward, AssistanceRecord
from app.utils.security import get_password_hash
import uuid

def create_test_admin(test_db: Session, username=None):
    """Helper function to create a test admin user"""
    # Generate unique username if not provided
    if username is None:
        username = f"admin_{uuid.uuid4().hex[:8]}"
    
    # Check if user already exists
    existing_user = test_db.query(User).filter(User.username == username).first()
    if existing_user:
        return existing_user
    
    user = User(
        username=username,
        password_hash=get_password_hash("admin123"),
        role="director",
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user

def get_auth_token(test_client, username="admin", password="admin123"):
    """Helper function to get authentication token"""
    response = test_client.post("/api/auth/login", json={
        "username": username,
        "password": password
    })
    
    # Check if login was successful
    if response.status_code != 200:
        raise Exception(f"Login failed with status {response.status_code}: {response.json()}")
    
    data = response.json()
    if "access_token" not in data:
        raise Exception(f"access_token not found in response: {data}")
    
    return data["access_token"]

def test_create_director_note(test_client, test_db: Session):
    """Test creating a director note"""
    # Setup
    admin = create_test_admin(test_db, "admin_create_note")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Create academic year
    academic_year = AcademicYear(
        year_name="2025-2026",
        description="Test academic year",
        is_active=True
    )
    test_db.add(academic_year)
    test_db.commit()
    test_db.refresh(academic_year)
    
    # Test creating a director note
    note_data = {
        "academic_year_id": academic_year.id,
        "folder_type": "notes",
        "title": "Meeting Notes",
        "content": "Discussed upcoming school events and parent meeting schedule",
        "note_date": "2025-10-15"
    }
    
    response = test_client.post(
        "/api/director/notes",
        json=note_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Meeting Notes"
    assert data["folder_type"] == "notes"
    assert data["id"] is not None

def test_get_director_notes(test_client, test_db: Session):
    """Test getting director notes"""
    # Setup
    admin = create_test_admin(test_db, "admin_get_notes")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Create academic year
    academic_year = AcademicYear(
        year_name="2025-2026",
        description="Test academic year",
        is_active=True
    )
    test_db.add(academic_year)
    test_db.commit()
    test_db.refresh(academic_year)
    
    # Create a director note
    note = DirectorNote(
        academic_year_id=academic_year.id,
        folder_type="notes",
        title="Meeting Notes",
        content="Discussed upcoming school events and parent meeting schedule",
        note_date="2025-10-15"
    )
    test_db.add(note)
    test_db.commit()
    
    # Test getting director notes
    response = test_client.get(
        "/api/director/notes",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_create_reward(test_client, test_db: Session):
    """Test creating a reward"""
    # Setup
    admin = create_test_admin(test_db, "admin_create_reward")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Create academic year
    academic_year = AcademicYear(
        year_name="2025-2026",
        description="Test academic year",
        is_active=True
    )
    test_db.add(academic_year)
    test_db.commit()
    test_db.refresh(academic_year)
    
    # Test creating a reward
    reward_data = {
        "academic_year_id": academic_year.id,
        "title": "Excellent Performance Award",
        "reward_date": "2025-10-20",
        "recipient_name": "Ahmed Mohamed",
        "recipient_type": "student",
        "amount": 100.00,
        "description": "For outstanding academic performance"
    }
    
    response = test_client.post(
        "/api/director/rewards",
        json=reward_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Excellent Performance Award"
    assert data["recipient_type"] == "student"
    assert data["amount"] == 100.00
    assert data["id"] is not None

def test_get_rewards(test_client, test_db: Session):
    """Test getting rewards"""
    # Setup
    admin = create_test_admin(test_db, "admin_get_rewards")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Create academic year
    academic_year = AcademicYear(
        year_name="2025-2026",
        description="Test academic year",
        is_active=True
    )
    test_db.add(academic_year)
    test_db.commit()
    test_db.refresh(academic_year)
    
    # Create a reward
    reward = Reward(
        academic_year_id=academic_year.id,
        title="Excellent Performance Award",
        reward_date="2025-10-20",
        recipient_name="Ahmed Mohamed",
        recipient_type="student",
        amount=100.00,
        description="For outstanding academic performance"
    )
    test_db.add(reward)
    test_db.commit()
    
    # Test getting rewards
    response = test_client.get(
        "/api/director/rewards",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_create_assistance_record(test_client, test_db: Session):
    """Test creating an assistance record"""
    # Setup
    admin = create_test_admin(test_db, "admin_create_assistance")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Create academic year
    academic_year = AcademicYear(
        year_name="2025-2026",
        description="Test academic year",
        is_active=True
    )
    test_db.add(academic_year)
    test_db.commit()
    test_db.refresh(academic_year)
    
    # Test creating an assistance record
    assistance_data = {
        "academic_year_id": academic_year.id,
        "assistance_date": "2025-10-25",
        "recipient_name": "Fatima Hassan",
        "recipient_type": "family",
        "assistance_type": "financial",
        "amount": 500.00,
        "description": "Financial assistance for school supplies"
    }
    
    response = test_client.post(
        "/api/director/assistance",
        json=assistance_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["recipient_name"] == "Fatima Hassan"
    assert data["assistance_type"] == "financial"
    assert data["amount"] == 500.00
    assert data["id"] is not None

def test_get_assistance_records(test_client, test_db: Session):
    """Test getting assistance records"""
    # Setup
    admin = create_test_admin(test_db, "admin_get_assistance")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Create academic year
    academic_year = AcademicYear(
        year_name="2025-2026",
        description="Test academic year",
        is_active=True
    )
    test_db.add(academic_year)
    test_db.commit()
    test_db.refresh(academic_year)
    
    # Create an assistance record
    assistance = AssistanceRecord(
        academic_year_id=academic_year.id,
        assistance_date="2025-10-25",
        recipient_name="Fatima Hassan",
        recipient_type="family",
        assistance_type="financial",
        amount=500.00,
        description="Financial assistance for school supplies"
    )
    test_db.add(assistance)
    test_db.commit()
    
    # Test getting assistance records
    response = test_client.get(
        "/api/director/assistance",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_director_dashboard_statistics(test_client, test_db: Session):
    """Test getting director dashboard statistics"""
    # Setup
    admin = create_test_admin(test_db, "admin_dashboard_stats")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Test getting dashboard statistics
    response = test_client.get(
        "/api/director/dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    # Should contain various statistics
    assert "total_students" in data
    assert "total_teachers" in data
    assert "total_classes" in data