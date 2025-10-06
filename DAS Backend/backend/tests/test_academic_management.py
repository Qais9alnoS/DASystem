import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.academic import AcademicYear, Class, Subject
from app.utils.security import get_password_hash
import uuid
from datetime import date

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

def test_create_academic_year(test_client, test_db: Session):
    """Test creating a new academic year"""
    # Setup
    admin = create_test_admin(test_db, "admin_academic_year")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Test creating an academic year
    academic_year_data = {
        "year_name": "2025-2026",
        "description": "Test academic year for testing",
        "is_active": True
    }
    
    response = test_client.post(
        "/api/academic/years",
        json=academic_year_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["year_name"] == "2025-2026"
    assert data["id"] is not None

def test_get_academic_years(test_client, test_db: Session):
    """Test getting list of academic years"""
    # Setup
    admin = create_test_admin(test_db, "admin_get_academic")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Create an academic year
    academic_year = AcademicYear(
        year_name="2025-2026",
        description="Test academic year",
        is_active=True
    )
    test_db.add(academic_year)
    test_db.commit()
    
    # Test getting academic years
    response = test_client.get(
        "/api/academic/years",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_create_class(test_client, test_db: Session):
    """Test creating a new class"""
    # Setup
    admin = create_test_admin(test_db, "admin_create_class")
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
    
    # Test creating a class
    class_data = {
        "academic_year_id": academic_year.id,
        "session_type": "morning",
        "grade_level": "primary",
        "grade_number": 1,
        "section_count": 3,
        "max_students_per_section": 30
    }
    
    response = test_client.post(
        "/api/academic/classes",
        json=class_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["grade_level"] == "primary"
    assert data["grade_number"] == 1
    assert data["id"] is not None

def test_get_classes(test_client, test_db: Session):
    """Test getting list of classes"""
    # Setup
    admin = create_test_admin(test_db, "admin_get_classes")
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
    
    # Create a class
    class_obj = Class(
        academic_year_id=academic_year.id,
        session_type="morning",
        grade_level="primary",
        grade_number=1,
        section_count=3,
        max_students_per_section=30
    )
    test_db.add(class_obj)
    test_db.commit()
    
    # Test getting classes
    response = test_client.get(
        "/api/academic/classes",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_create_subject(test_client, test_db: Session):
    """Test creating a new subject"""
    # Setup
    admin = create_test_admin(test_db, "admin_create_subject")
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
    
    # Create a class
    class_obj = Class(
        academic_year_id=academic_year.id,
        session_type="morning",
        grade_level="primary",
        grade_number=1,
        section_count=3,
        max_students_per_section=30
    )
    test_db.add(class_obj)
    test_db.commit()
    test_db.refresh(class_obj)
    
    # Test creating a subject
    subject_data = {
        "class_id": class_obj.id,
        "subject_name": "Mathematics",
        "weekly_hours": 5
    }
    
    response = test_client.post(
        "/api/academic/subjects",
        json=subject_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["subject_name"] == "Mathematics"
    assert data["weekly_hours"] == 5
    assert data["id"] is not None

def test_get_subjects(test_client, test_db: Session):
    """Test getting list of subjects"""
    # Setup
    admin = create_test_admin(test_db, "admin_get_subjects")
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
    
    # Create a class
    class_obj = Class(
        academic_year_id=academic_year.id,
        session_type="morning",
        grade_level="primary",
        grade_number=1,
        section_count=3,
        max_students_per_section=30
    )
    test_db.add(class_obj)
    test_db.commit()
    test_db.refresh(class_obj)
    
    # Create a subject
    subject = Subject(
        class_id=class_obj.id,
        subject_name="Mathematics",
        weekly_hours=5
    )
    test_db.add(subject)
    test_db.commit()
    
    # Test getting subjects
    response = test_client.get(
        "/api/academic/subjects",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_update_academic_year(test_client, test_db: Session):
    """Test updating an academic year"""
    # Setup
    admin = create_test_admin(test_db, "admin_update_academic_year")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Create an academic year
    academic_year = AcademicYear(
        year_name="2025-2026",
        description="Test academic year",
        is_active=True
    )
    test_db.add(academic_year)
    test_db.commit()
    test_db.refresh(academic_year)
    
    # Test updating academic year
    update_data = {
        "year_name": "2026-2027",
        "description": "Updated academic year"
    }
    
    response = test_client.put(
        f"/api/academic/years/{academic_year.id}",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["year_name"] == "2026-2027"
    assert data["description"] == "Updated academic year"

def test_delete_academic_year(test_client, test_db: Session):
    """Test deleting an academic year"""
    # Setup
    admin = create_test_admin(test_db, "admin_delete_academic_year")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Create an academic year
    academic_year = AcademicYear(
        year_name="2025-2026",
        description="Test academic year",
        is_active=True
    )
    test_db.add(academic_year)
    test_db.commit()
    test_db.refresh(academic_year)
    
    # Test deleting academic year
    response = test_client.delete(
        f"/api/academic/years/{academic_year.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Academic year deleted successfully"

def test_update_class(test_client, test_db: Session):
    """Test updating a class"""
    # Setup
    admin = create_test_admin(test_db, "admin_update_class")
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
    
    # Create a class
    class_obj = Class(
        academic_year_id=academic_year.id,
        session_type="morning",
        grade_level="primary",
        grade_number=1,
        section_count=3,
        max_students_per_section=30
    )
    test_db.add(class_obj)
    test_db.commit()
    test_db.refresh(class_obj)
    
    # Test updating class
    update_data = {
        "grade_number": 2,
        "section_count": 4
    }
    
    response = test_client.put(
        f"/api/academic/classes/{class_obj.id}",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["grade_number"] == 2
    assert data["section_count"] == 4

def test_delete_class(test_client, test_db: Session):
    """Test deleting a class"""
    # Setup
    admin = create_test_admin(test_db, "admin_delete_class")
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
    
    # Create a class
    class_obj = Class(
        academic_year_id=academic_year.id,
        session_type="morning",
        grade_level="primary",
        grade_number=1,
        section_count=3,
        max_students_per_section=30
    )
    test_db.add(class_obj)
    test_db.commit()
    test_db.refresh(class_obj)
    
    # Test deleting class
    response = test_client.delete(
        f"/api/academic/classes/{class_obj.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Class deleted successfully"

def test_update_subject(test_client, test_db: Session):
    """Test updating a subject"""
    # Setup
    admin = create_test_admin(test_db, "admin_update_subject")
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
    
    # Create a class
    class_obj = Class(
        academic_year_id=academic_year.id,
        session_type="morning",
        grade_level="primary",
        grade_number=1,
        section_count=3,
        max_students_per_section=30
    )
    test_db.add(class_obj)
    test_db.commit()
    test_db.refresh(class_obj)
    
    # Create a subject
    subject = Subject(
        class_id=class_obj.id,
        subject_name="Mathematics",
        weekly_hours=5
    )
    test_db.add(subject)
    test_db.commit()
    test_db.refresh(subject)
    
    # Test updating subject
    update_data = {
        "subject_name": "Advanced Mathematics",
        "weekly_hours": 6
    }
    
    response = test_client.put(
        f"/api/academic/subjects/{subject.id}",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["subject_name"] == "Advanced Mathematics"
    assert data["weekly_hours"] == 6

def test_delete_subject(test_client, test_db: Session):
    """Test deleting a subject"""
    # Setup
    admin = create_test_admin(test_db, "admin_delete_subject")
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
    
    # Create a class
    class_obj = Class(
        academic_year_id=academic_year.id,
        session_type="morning",
        grade_level="primary",
        grade_number=1,
        section_count=3,
        max_students_per_section=30
    )
    test_db.add(class_obj)
    test_db.commit()
    test_db.refresh(class_obj)
    
    # Create a subject
    subject = Subject(
        class_id=class_obj.id,
        subject_name="Mathematics",
        weekly_hours=5
    )
    test_db.add(subject)
    test_db.commit()
    test_db.refresh(subject)
    
    # Test deleting subject
    response = test_client.delete(
        f"/api/academic/subjects/{subject.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Subject deleted successfully"