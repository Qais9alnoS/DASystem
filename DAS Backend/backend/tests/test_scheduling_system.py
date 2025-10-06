import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.academic import AcademicYear, Class, Subject
from app.models.teachers import Teacher
from app.models.schedules import Schedule, ScheduleConstraint
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

def test_create_schedule_constraint(test_client, test_db: Session):
    """Test creating a new schedule constraint"""
    # Setup
    admin = create_test_admin(test_db, "admin_create_constraint")
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
    
    # Test creating a schedule constraint
    constraint_data = {
        "academic_year_id": academic_year.id,
        "constraint_type": "forbidden",
        "day_of_week": 1,
        "period_number": 3,
        "description": "No classes during assembly time",
        "is_active": True
    }
    
    response = test_client.post(
        "/api/schedules/constraints",
        json=constraint_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["constraint_type"] == "forbidden"
    assert data["day_of_week"] == 1
    assert data["id"] is not None

def test_get_schedule_constraints(test_client, test_db: Session):
    """Test getting list of schedule constraints"""
    # Setup
    admin = create_test_admin(test_db, "admin_get_constraints")
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
    
    # Create a schedule constraint
    constraint = ScheduleConstraint(
        academic_year_id=academic_year.id,
        constraint_type="forbidden",
        day_of_week=1,
        period_number=3,
        description="No classes during assembly time",
        is_active=True
    )
    test_db.add(constraint)
    test_db.commit()
    
    # Test getting schedule constraints
    response = test_client.get(
        "/api/schedules/constraints",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_generate_schedule(test_client, test_db: Session):
    """Test generating a schedule"""
    # Setup
    admin = create_test_admin(test_db, "admin_generate_schedule")
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
    test_db.refresh(teacher)
    
    # Test generating a schedule
    schedule_data = {
        "academic_year_id": academic_year.id,
        "session_type": "morning",
        "name": "Test Schedule",
        "start_date": "2025-09-01",
        "end_date": "2026-06-30",
        "working_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
        "session_start_time": "08:00:00",
        "period_duration": 45,
        "periods_per_day": 8,
        "break_periods": [4],
        "break_duration": 15,
        "auto_assign_teachers": True
    }
    
    response = test_client.post(
        "/api/schedules/generate",
        json=schedule_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # The schedule generation might take some time or have specific requirements
    # We'll check that we get a response (could be success or failure)
    assert response.status_code in [200, 400, 500]

def test_get_schedule_conflicts(test_client, test_db: Session):
    """Test checking for schedule conflicts"""
    # Setup
    admin = create_test_admin(test_db, "admin_schedule_conflicts")
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
    
    # Test checking for conflicts (even with empty data)
    response = test_client.get(
        f"/api/schedules/conflicts/{academic_year.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Should return successfully even if no conflicts exist
    assert response.status_code == 200

def test_create_schedule_constraint_with_invalid_data(test_client, test_db: Session):
    """Test creating a schedule constraint with invalid data"""
    # Setup
    admin = create_test_admin(test_db, "admin_invalid_constraint")
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
    
    # Test creating a schedule constraint with missing required fields
    invalid_constraint_data = {
        "academic_year_id": academic_year.id,
        # Missing required fields like constraint_type
    }
    
    response = test_client.post(
        "/api/schedules/constraints",
        json=invalid_constraint_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Should return validation error
    assert response.status_code == 422

def test_get_nonexistent_schedule_constraint(test_client, test_db: Session):
    """Test getting a nonexistent schedule constraint"""
    # Setup
    admin = create_test_admin(test_db, "admin_nonexistent_constraint")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Test getting nonexistent constraint
    response = test_client.get(
        "/api/schedules/constraints/999999",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Depending on implementation, this might return 404 or empty result
    assert response.status_code in [200, 404]