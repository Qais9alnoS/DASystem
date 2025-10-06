import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.academic import AcademicYear
from app.models.students import Student
from app.models.teachers import Teacher
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

def test_universal_search(test_client, test_db: Session):
    """Test universal search functionality"""
    # Setup
    admin = create_test_admin(test_db, "admin_universal_search")
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
    
    # Create a student
    student = Student(
        academic_year_id=academic_year.id,
        full_name="Ahmed Mohamed",
        father_name="Mohamed Ali",
        mother_name="Fatima Hassan",
        birth_date="2015-05-15",
        birth_place="Cairo",
        nationality="Egyptian",
        gender="male",
        transportation_type="bus",
        bus_number="B123",
        landline_phone="12345678",
        father_phone="87654321",
        detailed_address="123 Main St, Cairo",
        grade_level="primary",
        grade_number=1,
        section="A",
        session_type="morning",
        is_active=True
    )
    test_db.add(student)
    test_db.commit()
    
    # Create a teacher
    teacher = Teacher(
        academic_year_id=academic_year.id,
        full_name="Dr. Sarah Johnson",
        gender="female",
        birth_date="1985-03-20",
        phone="0123456789",
        nationality="Egyptian",
        detailed_address="456 Teacher St, Cairo",
        transportation_type="private",
        qualifications="M.Ed in Mathematics",
        experience="10 years teaching experience",
        is_active=True
    )
    test_db.add(teacher)
    test_db.commit()
    
    # Test universal search
    response = test_client.get(
        "/api/search/universal?query=Ahmed",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "students" in data
    assert "teachers" in data

def test_student_search(test_client, test_db: Session):
    """Test student-specific search"""
    # Setup
    admin = create_test_admin(test_db, "admin_student_search")
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
    
    # Create a student
    student = Student(
        academic_year_id=academic_year.id,
        full_name="Ahmed Mohamed",
        father_name="Mohamed Ali",
        mother_name="Fatima Hassan",
        birth_date="2015-05-15",
        birth_place="Cairo",
        nationality="Egyptian",
        gender="male",
        transportation_type="bus",
        bus_number="B123",
        landline_phone="12345678",
        father_phone="87654321",
        detailed_address="123 Main St, Cairo",
        grade_level="primary",
        grade_number=1,
        section="A",
        session_type="morning",
        is_active=True
    )
    test_db.add(student)
    test_db.commit()
    
    # Test student search
    response = test_client.get(
        "/api/search/students?query=Ahmed",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should find at least one student
    assert len(data) >= 1

def test_teacher_search(test_client, test_db: Session):
    """Test teacher-specific search"""
    # Setup
    admin = create_test_admin(test_db, "admin_teacher_search")
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
    
    # Create a teacher
    teacher = Teacher(
        academic_year_id=academic_year.id,
        full_name="Dr. Sarah Johnson",
        gender="female",
        birth_date="1985-03-20",
        phone="0123456789",
        nationality="Egyptian",
        detailed_address="456 Teacher St, Cairo",
        transportation_type="private",
        qualifications="M.Ed in Mathematics",
        experience="10 years teaching experience",
        is_active=True
    )
    test_db.add(teacher)
    test_db.commit()
    
    # Test teacher search
    response = test_client.get(
        "/api/search/teachers?query=Sarah",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should find at least one teacher
    assert len(data) >= 1

def test_search_with_no_results(test_client, test_db: Session):
    """Test search with query that returns no results"""
    # Setup
    admin = create_test_admin(test_db, "admin_search_no_results")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Test search with query that won't match anything
    response = test_client.get(
        "/api/search/universal?query=NonExistentQuery12345",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    # Should return empty results but not fail
    assert "students" in data
    assert "teachers" in data

def test_search_without_token(test_client, test_db: Session):
    """Test search without authentication token"""
    # Test search without token should fail
    response = test_client.get("/api/search/universal?query=test")
    
    assert response.status_code == 401