#!/usr/bin/env python3
"""
Test Data Generator for School Management System
Creates realistic test data that mimics a real school environment.
"""

import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.users import User
from app.models.academic import AcademicYear, Class, Subject
from app.models.students import Student
from app.models.teachers import Teacher
from app.models.activities import Activity
from app.models.finance import FinanceCategory, FinanceTransaction
from app.utils.security import get_password_hash

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

def create_test_database():
    """Create a test database with realistic sample data"""
    # Test database configuration
    TEST_DATABASE_URL = "sqlite:///./test_school_management.db"
    
    # Create engine and tables
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create admin user
        admin_user = User(
            username="admin",
            password_hash=get_password_hash("admin123"),
            role="director",
            is_active=True
        )
        db.add(admin_user)
        
        # Create academic years
        academic_years = []
        for i, (year, desc) in enumerate([
            ("2023-2024", "Previous academic year"),
            ("2024-2025", "Current academic year"),
            ("2025-2026", "Next academic year")
        ]):
            academic_year = AcademicYear(
                year_name=year,
                description=desc,
                is_active=(i == 1)  # Only current year is active
            )
            db.add(academic_year)
            db.flush()  # Get the ID without committing
            academic_years.append(academic_year)
        
        current_year = academic_years[1]  # Current academic year
        
        # Create classes for current year
        classes = []
        grade_configs = [
            ("primary", 1, 30),
            ("primary", 2, 30),
            ("primary", 3, 30),
            ("primary", 4, 30),
            ("primary", 5, 30),
            ("primary", 6, 30),
            ("intermediate", 1, 25),
            ("intermediate", 2, 25),
            ("intermediate", 3, 25),
            ("secondary", 1, 20),
            ("secondary", 2, 20),
            ("secondary", 3, 20)
        ]
        
        for grade_level, grade_number, max_students in grade_configs:
            class_obj = Class(
                academic_year_id=current_year.id,
                session_type="morning",
                grade_level=grade_level,
                grade_number=grade_number,
                section_count=3,
                max_students_per_section=max_students
            )
            db.add(class_obj)
            db.flush()
            classes.append(class_obj)
        
        # Create subjects
        subjects = []
        subject_names = [
            "Mathematics", "Arabic Language", "English Language", 
            "Science", "Social Studies", "Islamic Education",
            "Physical Education", "Art", "Music"
        ]
        
        for class_obj in classes:
            for subject_name in subject_names:
                # Adjust weekly hours based on grade level
                if class_obj.grade_level == "primary":
                    weekly_hours = 4 if subject_name in ["Mathematics", "Arabic Language", "English Language"] else 2
                elif class_obj.grade_level == "intermediate":
                    weekly_hours = 5 if subject_name in ["Mathematics", "Arabic Language", "English Language", "Science"] else 2
                else:  # secondary
                    weekly_hours = 6 if subject_name in ["Mathematics", "Arabic Language", "English Language", "Science"] else 3
                
                subject = Subject(
                    class_id=class_obj.id,
                    subject_name=subject_name,
                    weekly_hours=weekly_hours
                )
                db.add(subject)
                db.flush()
                subjects.append(subject)
        
        # Create teachers
        teachers = []
        teacher_data = [
            ("Dr. Sarah Johnson", "female", "Mathematics Specialist"),
            ("Mr. Ahmed Hassan", "male", "Arabic Language Expert"),
            ("Ms. Fatima Ali", "female", "English Teacher"),
            ("Dr. Mohamed Khalil", "male", "Science Teacher"),
            ("Ms. Aisha Mahmoud", "female", "Social Studies Teacher"),
            ("Mr. Youssef Ibrahim", "male", "Islamic Education"),
            ("Ms. Layla Omar", "female", "Physical Education"),
            ("Mr. Karim Said", "male", "Art Teacher"),
            ("Ms. Nadia Farouk", "female", "Music Teacher")
        ]
        
        for i, (name, gender, qualification) in enumerate(teacher_data):
            teacher = Teacher(
                academic_year_id=current_year.id,
                full_name=name,
                gender=gender,
                birth_date=f"1980-0{i%12+1}-15",
                phone=f"012345678{i}",
                nationality="Egyptian",
                detailed_address=f"{100+i} Teacher Street, Cairo",
                transportation_type="private" if i % 2 == 0 else "public",
                qualifications=qualification,
                experience=f"{10+i} years teaching experience",
                is_active=True
            )
            db.add(teacher)
            db.flush()
            teachers.append(teacher)
        
        # Create students (100 students across all classes)
        students = []
        for i in range(100):
            # Distribute students across classes
            class_index = i % len(classes)
            class_obj = classes[class_index]
            
            student = Student(
                academic_year_id=current_year.id,
                full_name=f"Student {i+1}",
                has_special_needs=(i % 20 == 0),  # 5% have special needs
                special_needs_details="Learning disability" if i % 20 == 0 else None,
                father_name=f"Father of Student {i+1}",
                grandfather_name=f"Grandfather of Student {i+1}",
                mother_name=f"Mother of Student {i+1}",
                birth_date=f"2010-0{i%12+1}-{i%28+1}",
                birth_place="Cairo",
                nationality="Egyptian",
                father_occupation="Engineer" if i % 3 == 0 else "Doctor" if i % 3 == 1 else "Teacher",
                mother_occupation="Teacher" if i % 3 == 0 else "Engineer" if i % 3 == 1 else "Doctor",
                religion="Muslim",
                gender="male" if i % 2 == 0 else "female",
                transportation_type="bus" if i % 3 == 0 else "private" if i % 3 == 1 else "walking",
                bus_number=f"B{i%10+1}" if i % 3 == 0 else None,
                landline_phone=f"1234567{i%10}",
                father_phone=f"012345678{i%10}",
                mother_phone=f"098765432{i%10}",
                additional_phone=f"011223344{i%10}" if i % 5 == 0 else None,
                detailed_address=f"{1000+i} Student Street, Cairo",
                previous_school="Previous Elementary School" if class_obj.grade_level == "primary" else "Previous Intermediate School",
                grade_level=class_obj.grade_level,
                grade_number=class_obj.grade_number,
                section=chr(65 + (i % 3)),  # A, B, C
                session_type="morning",
                ninth_grade_total=400.0 if class_obj.grade_level == "secondary" else None,
                notes="Good student" if i % 10 == 0 else "Needs improvement" if i % 10 == 5 else None,
                is_active=True
            )
            db.add(student)
            db.flush()
            students.append(student)
        
        # Create activities
        activities = []
        activity_data = [
            ("Science Fair", "academic", "2024-11-15", "2024-11-16", 50.00),
            ("Sports Day", "sports", "2024-12-10", "2024-12-10", 20.00),
            ("Cultural Festival", "cultural", "2025-01-20", "2025-01-22", 30.00),
            ("Field Trip", "trip", "2025-02-15", "2025-02-15", 100.00),
            ("Parent Meeting", "social", "2024-10-30", "2024-10-30", 0.00)
        ]
        
        for name, activity_type, start_date, end_date, cost in activity_data:
            activity = Activity(
                academic_year_id=current_year.id,
                name=name,
                description=f"{name} event for students",
                activity_type=activity_type,
                session_type="mixed",
                target_grades=["primary", "intermediate", "secondary"],
                max_participants=200,
                cost_per_student=cost,
                start_date=start_date,
                end_date=end_date,
                registration_deadline=f"2024-10-01" if "2024" in start_date else "2025-01-01",
                location="School Campus",
                instructor_name="Dr. Sarah Johnson",
                is_active=True
            )
            db.add(activity)
            db.flush()
            activities.append(activity)
        
        # Create finance categories
        categories = []
        category_data = [
            ("School Fees", "income", True),
            ("Bus Transportation", "income", True),
            ("Teacher Salaries", "expense", True),
            ("Utilities", "expense", True),
            ("Supplies", "expense", True),
            ("Activities", "expense", True)
        ]
        
        for name, cat_type, is_default in category_data:
            category = FinanceCategory(
                category_name=name,
                category_type=cat_type,
                is_default=is_default,
                is_active=True
            )
            db.add(category)
            db.flush()
            categories.append(category)
        
        # Create finance transactions
        transactions = []
        # Income transactions
        for i in range(20):
            transaction = FinanceTransaction(
                academic_year_id=current_year.id,
                category_id=categories[0].id,  # School Fees
                transaction_type="income",
                amount=1000.00 + (i * 100),
                transaction_date=f"2024-09-{10+i:02d}",
                description=f"Monthly fees collection {i+1}",
                reference_type="general",
                created_by=admin_user.id
            )
            db.add(transaction)
            transactions.append(transaction)
        
        # Expense transactions
        for i in range(15):
            category_index = 2 + (i % 4)  # Expense categories
            transaction = FinanceTransaction(
                academic_year_id=current_year.id,
                category_id=categories[category_index].id,
                transaction_type="expense",
                amount=500.00 + (i * 50),
                transaction_date=f"2024-09-{15+i:02d}",
                description=f"Expense for {categories[category_index].category_name}",
                reference_type="general",
                created_by=admin_user.id
            )
            db.add(transaction)
            transactions.append(transaction)
        
        # Commit all changes
        db.commit()
        print("✅ Test database created successfully with realistic sample data!")
        print(f"📊 Database contains:")
        print(f"   - 1 Admin user")
        print(f"   - 3 Academic years")
        print(f"   - {len(classes)} Classes")
        print(f"   - {len(subjects)} Subjects")
        print(f"   - {len(teachers)} Teachers")
        print(f"   - {len(students)} Students")
        print(f"   - {len(activities)} Activities")
        print(f"   - {len(categories)} Finance categories")
        print(f"   - {len(transactions)} Financial transactions")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating test database: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_database()