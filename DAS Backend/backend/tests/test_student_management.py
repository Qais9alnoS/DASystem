import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.academic import AcademicYear, Class
from app.models.students import Student
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

def test_create_student(test_client, test_db: Session):
    """Test creating a new student"""
    # Setup
    admin = create_test_admin(test_db, "admin_create_student")
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
    
    # Test creating a student
    student_data = {
        "academic_year_id": academic_year.id,
        "full_name": "Ahmed Mohamed",
        "father_name": "Mohamed Ali",
        "mother_name": "Fatima Hassan",
        "birth_date": "2015-05-15",
        "birth_place": "Cairo",
        "nationality": "Egyptian",
        "gender": "male",
        "transportation_type": "bus",
        "bus_number": "B123",
        "landline_phone": "12345678",
        "father_phone": "87654321",
        "detailed_address": "123 Main St, Cairo",
        "grade_level": "primary",
        "grade_number": 1,
        "section": "A",
        "session_type": "morning",
        "is_active": True
    }
    
    response = test_client.post(
        "/api/students",
        json=student_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Ahmed Mohamed"
    assert data["id"] is not None

def test_get_students(test_client, test_db: Session):
    """Test getting list of students"""
    # Setup
    admin = create_test_admin(test_db, "admin_get_students")
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
    
    # Test getting students
    response = test_client.get(
        "/api/students",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_get_student_by_id(test_client, test_db: Session):
    """Test getting a specific student by ID"""
    # Setup
    admin = create_test_admin(test_db, "admin_get_student")
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
    test_db.refresh(student)
    
    # Test getting student by ID
    response = test_client.get(
        f"/api/students/{student.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == student.id
    assert data["full_name"] == "Ahmed Mohamed"

def test_update_student(test_client, test_db: Session):
    """Test updating a student"""
    # Setup
    admin = create_test_admin(test_db, "admin_update_student")
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
    test_db.refresh(student)
    
    # Update student data
    update_data = {
        "full_name": "Ahmed Mohamed Updated",
        "grade_number": 2
    }
    
    response = test_client.put(
        f"/api/students/{student.id}",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Ahmed Mohamed Updated"
    assert data["grade_number"] == 2

def test_delete_student(test_client, test_db: Session):
    """Test deleting a student"""
    # Setup
    admin = create_test_admin(test_db, "admin_delete_student")
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
    test_db.refresh(student)
    
    # Test deleting student
    response = test_client.delete(
        f"/api/students/{student.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Student deleted successfully"

def test_create_student_with_invalid_data(test_client, test_db: Session):
    """Test creating a student with invalid data"""
    # Setup
    admin = create_test_admin(test_db, "admin_invalid_student")
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
    
    # Test creating a student with missing required fields
    invalid_student_data = {
        "academic_year_id": academic_year.id,
        # Missing required fields like full_name
    }
    
    response = test_client.post(
        "/api/students",
        json=invalid_student_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Should return validation error
    assert response.status_code == 422

def test_get_nonexistent_student(test_client, test_db: Session):
    """Test getting a nonexistent student"""
    # Setup
    admin = create_test_admin(test_db, "admin_nonexistent_student")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Test getting nonexistent student
    response = test_client.get(
        "/api/students/999999",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 404

def test_update_nonexistent_student(test_client, test_db: Session):
    """Test updating a nonexistent student"""
    # Setup
    admin = create_test_admin(test_db, "admin_update_nonexistent")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Test updating nonexistent student
    update_data = {
        "full_name": "Updated Name"
    }
    
    response = test_client.put(
        "/api/students/999999",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 404

def test_delete_nonexistent_student(test_client, test_db: Session):
    """Test deleting a nonexistent student"""
    # Setup
    admin = create_test_admin(test_db, "admin_delete_nonexistent")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Test deleting nonexistent student
    response = test_client.delete(
        "/api/students/999999",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 404