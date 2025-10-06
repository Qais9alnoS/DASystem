import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.academic import AcademicYear
from app.models.finance import FinanceCategory, FinanceTransaction
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

def test_create_finance_category(test_client, test_db: Session):
    """Test creating a new finance category"""
    # Setup
    admin = create_test_admin(test_db, "admin_finance_category")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Test creating a finance category
    category_data = {
        "category_name": "School Fees",
        "category_type": "income",
        "is_default": True,
        "is_active": True
    }
    
    response = test_client.post(
        "/api/finance/categories",
        json=category_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["category_name"] == "School Fees"
    assert data["category_type"] == "income"
    assert data["id"] is not None

def test_get_finance_categories(test_client, test_db: Session):
    """Test getting list of finance categories"""
    # Setup
    admin = create_test_admin(test_db, "admin_get_categories")
    token = get_auth_token(test_client, admin.username, "admin123")
    
    # Create a finance category
    category = FinanceCategory(
        category_name="School Fees",
        category_type="income",
        is_default=True,
        is_active=True
    )
    test_db.add(category)
    test_db.commit()
    
    # Test getting finance categories
    response = test_client.get(
        "/api/finance/categories",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_create_finance_transaction(test_client, test_db: Session):
    """Test creating a new finance transaction"""
    # Setup
    admin = create_test_admin(test_db, "admin_create_transaction")
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
    
    # Create a finance category
    category = FinanceCategory(
        category_name="School Fees",
        category_type="income",
        is_default=True,
        is_active=True
    )
    test_db.add(category)
    test_db.commit()
    test_db.refresh(category)
    
    # Test creating a finance transaction
    transaction_data = {
        "academic_year_id": academic_year.id,
        "category_id": category.id,
        "transaction_type": "income",
        "amount": 1000.00,
        "transaction_date": "2025-10-01",
        "description": "Monthly school fees collection",
        "reference_type": "general"
    }
    
    response = test_client.post(
        "/api/finance/transactions",
        json=transaction_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 1000.00
    assert data["transaction_type"] == "income"
    assert data["id"] is not None

def test_get_finance_transactions(test_client, test_db: Session):
    """Test getting list of finance transactions"""
    # Setup
    admin = create_test_admin(test_db, "admin_get_transactions")
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
    
    # Create a finance category
    category = FinanceCategory(
        category_name="School Fees",
        category_type="income",
        is_default=True,
        is_active=True
    )
    test_db.add(category)
    test_db.commit()
    test_db.refresh(category)
    
    # Create a finance transaction
    transaction = FinanceTransaction(
        academic_year_id=academic_year.id,
        category_id=category.id,
        transaction_type="income",
        amount=1000.00,
        transaction_date="2025-10-01",
        description="Monthly school fees collection",
        reference_type="general"
    )
    test_db.add(transaction)
    test_db.commit()
    
    # Test getting finance transactions
    response = test_client.get(
        "/api/finance/transactions",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_student_payment(test_client, test_db: Session):
    """Test recording student payment"""
    # Setup
    admin = create_test_admin(test_db, "admin_student_payment")
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
    
    # Create a finance category for student fees
    category = FinanceCategory(
        category_name="Student Fees",
        category_type="income",
        is_default=True,
        is_active=True
    )
    test_db.add(category)
    test_db.commit()
    test_db.refresh(category)
    
    # Test creating a student payment transaction
    payment_data = {
        "academic_year_id": academic_year.id,
        "category_id": category.id,
        "transaction_type": "income",
        "amount": 500.00,
        "transaction_date": "2025-10-01",
        "description": f"Payment for {student.full_name}",
        "reference_type": "student",
        "student_id": student.id
    }
    
    response = test_client.post(
        "/api/finance/transactions",
        json=payment_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 500.00
    assert data["reference_type"] == "student"
    assert data["student_id"] == student.id
    assert data["id"] is not None

def test_finance_reports(test_client, test_db: Session):
    """Test finance reporting functionality"""
    # Setup
    admin = create_test_admin(test_db, "admin_finance_reports")
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
    
    # Create finance categories
    income_category = FinanceCategory(
        category_name="School Fees",
        category_type="income",
        is_default=True,
        is_active=True
    )
    test_db.add(income_category)
    
    expense_category = FinanceCategory(
        category_name="Utilities",
        category_type="expense",
        is_default=True,
        is_active=True
    )
    test_db.add(expense_category)
    test_db.commit()
    
    # Create some transactions
    income_transaction = FinanceTransaction(
        academic_year_id=academic_year.id,
        category_id=income_category.id,
        transaction_type="income",
        amount=2000.00,
        transaction_date="2025-10-01",
        description="October fees collection",
        reference_type="general"
    )
    test_db.add(income_transaction)
    
    expense_transaction = FinanceTransaction(
        academic_year_id=academic_year.id,
        category_id=expense_category.id,
        transaction_type="expense",
        amount=500.00,
        transaction_date="2025-10-05",
        description="Electricity bill",
        reference_type="general"
    )
    test_db.add(expense_transaction)
    test_db.commit()
    
    # Test getting financial summary
    response = test_client.get(
        f"/api/finance/summary/{academic_year.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "total_income" in data
    assert "total_expenses" in data
    assert "net_balance" in data