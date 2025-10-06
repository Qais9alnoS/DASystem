import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.academic import AcademicYear, Class, Subject
from app.models.students import Student
from app.models.teachers import Teacher
from app.models.activities import Activity
from app.models.finance import FinanceCategory, FinanceTransaction
from app.models.schedules import ScheduleConstraint
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

def test_complete_school_workflow(test_client, test_db: Session):
    """Test a complete school management workflow"""
    # Step 1: Login as admin
    admin = create_test_admin(test_db, "admin_complete_workflow")
    token = get_auth_token(test_client, admin.username, "admin123")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Create academic year
    academic_year_data = {
        "year_name": "2025-2026",
        "description": "Test academic year",
        "is_active": True
    }
    
    response = test_client.post(
        "/api/academic/years",
        json=academic_year_data,
        headers=headers
    )
    assert response.status_code == 200
    academic_year = response.json()
    academic_year_id = academic_year["id"]
    
    # Step 3: Create class
    class_data = {
        "academic_year_id": academic_year_id,
        "session_type": "morning",
        "grade_level": "primary",
        "grade_number": 1,
        "section_count": 3,
        "max_students_per_section": 30
    }
    
    response = test_client.post(
        "/api/academic/classes",
        json=class_data,
        headers=headers
    )
    assert response.status_code == 200
    class_obj = response.json()
    class_id = class_obj["id"]
    
    # Step 4: Create subject
    subject_data = {
        "class_id": class_id,
        "subject_name": "Mathematics",
        "weekly_hours": 5
    }
    
    response = test_client.post(
        "/api/academic/subjects",
        json=subject_data,
        headers=headers
    )
    assert response.status_code == 200
    subject = response.json()
    subject_id = subject["id"]
    
    # Step 5: Create teacher
    teacher_data = {
        "academic_year_id": academic_year_id,
        "full_name": "Dr. Sarah Johnson",
        "gender": "female",
        "birth_date": "1985-03-20",
        "phone": "0123456789",
        "nationality": "Egyptian",
        "detailed_address": "456 Teacher St, Cairo",
        "transportation_type": "private",
        "qualifications": "M.Ed in Mathematics",
        "experience": "10 years teaching experience",
        "is_active": True
    }
    
    response = test_client.post(
        "/api/teachers",
        json=teacher_data,
        headers=headers
    )
    assert response.status_code == 200
    teacher = response.json()
    teacher_id = teacher["id"]
    
    # Step 6: Create student
    student_data = {
        "academic_year_id": academic_year_id,
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
        headers=headers
    )
    assert response.status_code == 200
    student = response.json()
    student_id = student["id"]
    
    # Step 7: Create finance category and transaction
    category_data = {
        "category_name": "School Fees",
        "category_type": "income",
        "is_default": True,
        "is_active": True
    }
    
    response = test_client.post(
        "/api/finance/categories",
        json=category_data,
        headers=headers
    )
    assert response.status_code == 200
    category = response.json()
    category_id = category["id"]
    
    transaction_data = {
        "academic_year_id": academic_year_id,
        "category_id": category_id,
        "transaction_type": "income",
        "amount": 1000.00,
        "transaction_date": "2025-10-01",
        "description": "Monthly school fees collection",
        "reference_type": "general"
    }
    
    response = test_client.post(
        "/api/finance/transactions",
        json=transaction_data,
        headers=headers
    )
    assert response.status_code == 200
    
    # Step 8: Create activity
    activity_data = {
        "academic_year_id": academic_year_id,
        "name": "Science Fair",
        "description": "Annual science fair event",
        "activity_type": "academic",
        "session_type": "morning",
        "target_grades": ["primary", "intermediate"],
        "max_participants": 100,
        "cost_per_student": 50.00,
        "start_date": "2025-11-15",
        "end_date": "2025-11-16",
        "registration_deadline": "2025-11-10",
        "location": "School Science Lab",
        "instructor_name": "Dr. Sarah Johnson",
        "is_active": True
    }
    
    response = test_client.post(
        "/api/activities",
        json=activity_data,
        headers=headers
    )
    assert response.status_code == 200
    activity = response.json()
    activity_id = activity["id"]
    
    # Step 9: Create schedule constraint
    constraint_data = {
        "academic_year_id": academic_year_id,
        "constraint_type": "forbidden",
        "day_of_week": 1,
        "period_number": 3,
        "description": "No classes during assembly time",
        "is_active": True
    }
    
    response = test_client.post(
        "/api/schedules/constraints",
        json=constraint_data,
        headers=headers
    )
    assert response.status_code == 200
    
    # Step 10: Verify all data was created correctly
    # Get academic years
    response = test_client.get("/api/academic/years", headers=headers)
    assert response.status_code == 200
    years = response.json()
    assert len(years) >= 1
    
    # Get classes
    response = test_client.get("/api/academic/classes", headers=headers)
    assert response.status_code == 200
    classes = response.json()
    assert len(classes) >= 1
    
    # Get subjects
    response = test_client.get("/api/academic/subjects", headers=headers)
    assert response.status_code == 200
    subjects = response.json()
    assert len(subjects) >= 1
    
    # Get teachers
    response = test_client.get("/api/teachers", headers=headers)
    assert response.status_code == 200
    teachers = response.json()
    assert len(teachers) >= 1
    
    # Get students
    response = test_client.get("/api/students", headers=headers)
    assert response.status_code == 200
    students = response.json()
    assert len(students) >= 1
    
    # Get activities
    response = test_client.get("/api/activities", headers=headers)
    assert response.status_code == 200
    activities = response.json()
    assert len(activities) >= 1
    
    print("✅ Complete school workflow test passed successfully!")

def test_user_role_permissions(test_client, test_db: Session):
    """Test user role-based permissions"""
    # Create admin user
    admin = create_test_admin(test_db, "admin_role_permissions")
    admin_token = get_auth_token(test_client, admin.username, "admin123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test that admin can access all endpoints
    response = test_client.get("/api/students", headers=admin_headers)
    assert response.status_code == 200
    
    response = test_client.get("/api/teachers", headers=admin_headers)
    assert response.status_code == 200
    
    response = test_client.get("/api/academic/years", headers=admin_headers)
    assert response.status_code == 200
    
    print("✅ User role permissions test passed successfully!")

def test_data_integrity_and_consistency(test_client, test_db: Session):
    """Test data integrity and consistency across the system"""
    # Create admin user
    admin = create_test_admin(test_db, "admin_data_integrity")
    token = get_auth_token(test_client, admin.username, "admin123")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create academic year
    academic_year_data = {
        "year_name": "2025-2026",
        "description": "Data integrity test year",
        "is_active": True
    }
    
    response = test_client.post(
        "/api/academic/years",
        json=academic_year_data,
        headers=headers
    )
    assert response.status_code == 200
    academic_year = response.json()
    academic_year_id = academic_year["id"]
    
    # Verify the academic year exists and is consistent
    response = test_client.get(f"/api/academic/years/{academic_year_id}", headers=headers)
    assert response.status_code == 200
    retrieved_year = response.json()
    assert retrieved_year["year_name"] == "2025-2026"
    assert retrieved_year["id"] == academic_year_id
    
    print("✅ Data integrity and consistency test passed successfully!")