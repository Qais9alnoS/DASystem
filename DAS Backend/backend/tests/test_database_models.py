import pytest
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.academic import AcademicYear, Class, Subject
from app.models.students import Student
from app.models.teachers import Teacher
from app.models.activities import Activity
from app.models.finance import FinanceCategory, FinanceTransaction
from app.utils.security import get_password_hash
from datetime import date

def test_user_model(test_db: Session):
    """Test User model creation and functionality"""
    # Create a user
    user = User(
        username="test_admin",
        password_hash=get_password_hash("test_password"),
        role="director",
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    
    # Verify user was created
    assert user.id is not None
    assert user.username == "test_admin"
    assert user.role == "director"
    assert user.is_active is True
    assert user.created_at is not None

def test_academic_year_model(test_db: Session):
    """Test AcademicYear model"""
    academic_year = AcademicYear(
        year_name="2025-2026",
        description="Test academic year",
        is_active=True
    )
    test_db.add(academic_year)
    test_db.commit()
    test_db.refresh(academic_year)
    
    assert academic_year.id is not None
    assert academic_year.year_name == "2025-2026"
    assert academic_year.is_active is True

def test_class_model(test_db: Session):
    """Test Class model"""
    # First create an academic year
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
    
    assert class_obj.id is not None
    assert class_obj.academic_year_id == academic_year.id
    assert class_obj.session_type == "morning"
    assert class_obj.grade_level == "primary"
    assert class_obj.grade_number == 1

def test_student_model(test_db: Session):
    """Test Student model"""
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
        grandfather_name="Ali Hassan",  # This field is required
        mother_name="Fatima Hassan",
        birth_date=date(2015, 5, 15),  # Use date object instead of string
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
    
    assert student.id is not None
    assert student.full_name == "Ahmed Mohamed"
    assert student.is_active is True

def test_teacher_model(test_db: Session):
    """Test Teacher model"""
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
        birth_date=date(1985, 3, 20),  # Use date object instead of string
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
    
    assert teacher.id is not None
    assert teacher.full_name == "Dr. Sarah Johnson"
    assert teacher.is_active is True

def test_activity_model(test_db: Session):
    """Test Activity model"""
    # Create academic year
    academic_year = AcademicYear(
        year_name="2025-2026",
        description="Test academic year",
        is_active=True
    )
    test_db.add(academic_year)
    test_db.commit()
    test_db.refresh(academic_year)
    
    # Create an activity
    activity = Activity(
        academic_year_id=academic_year.id,
        name="Science Fair",
        description="Annual science fair event",
        activity_type="academic",
        session_type="morning",
        target_grades=["primary", "intermediate"],
        max_participants=100,
        cost_per_student=50.00,
        start_date=date(2025, 11, 15),  # Use date object instead of string
        end_date=date(2025, 11, 16),    # Use date object instead of string
        registration_deadline=date(2025, 11, 10),  # Use date object instead of string
        location="School Science Lab",
        instructor_name="Dr. Sarah Johnson",
        is_active=True
    )
    test_db.add(activity)
    test_db.commit()
    test_db.refresh(activity)
    
    assert activity.id is not None
    assert activity.name == "Science Fair"
    assert activity.is_active is True

def test_finance_models(test_db: Session):
    """Test Finance models"""
    # Create academic year
    academic_year = AcademicYear(
        year_name="2025-2026",
        description="Test academic year",
        is_active=True
    )
    test_db.add(academic_year)
    test_db.commit()
    test_db.refresh(academic_year)
    
    # Create finance category
    category = FinanceCategory(
        category_name="School Fees",
        category_type="income",
        is_default=True,
        is_active=True
    )
    test_db.add(category)
    test_db.commit()
    test_db.refresh(category)
    
    # Create finance transaction
    transaction = FinanceTransaction(
        academic_year_id=academic_year.id,
        category_id=category.id,
        transaction_type="income",
        amount=1000.00,
        transaction_date=date(2025, 10, 1),  # Use date object instead of string
        description="Monthly school fees collection",
        reference_type="general"
    )
    test_db.add(transaction)
    test_db.commit()
    test_db.refresh(transaction)
    
    assert category.id is not None
    assert category.category_name == "School Fees"
    assert transaction.id is not None
    assert transaction.amount == 1000.00