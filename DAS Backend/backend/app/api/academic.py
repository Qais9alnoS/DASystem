from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.academic import AcademicYear, Class, Subject
from app.schemas.academic import (
    AcademicYearCreate, AcademicYearUpdate, AcademicYearResponse,
    ClassCreate, ClassResponse,
    SubjectCreate, SubjectResponse
)
from app.core.dependencies import get_current_user, get_director_user
from app.models.users import User

router = APIRouter()

# Academic Year Management
@router.get("/years", response_model=List[AcademicYearResponse])
async def get_academic_years(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all academic years"""
    years = db.query(AcademicYear).order_by(AcademicYear.created_at.desc()).all()
    return years

@router.post("/years", response_model=AcademicYearResponse)
async def create_academic_year(
    year_data: AcademicYearCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Create new academic year (Director only)"""
    # Check if year name already exists
    existing_year = db.query(AcademicYear).filter(AcademicYear.year_name == year_data.year_name).first()
    if existing_year:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Academic year with this name already exists"
        )
    
    # If setting as active, deactivate other years
    if year_data.is_active:
        db.query(AcademicYear).update({"is_active": False})
    
    new_year = AcademicYear(**year_data.dict())
    db.add(new_year)
    db.commit()
    db.refresh(new_year)
    
    return new_year

@router.put("/years/{year_id}", response_model=AcademicYearResponse)
async def update_academic_year(
    year_id: int,
    year_data: AcademicYearUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Update academic year (Director only)"""
    year = db.query(AcademicYear).filter(AcademicYear.id == year_id).first()
    if not year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic year not found"
        )
    
    # If setting as active, deactivate other years
    if year_data.is_active:
        db.query(AcademicYear).update({"is_active": False})
    
    for field, value in year_data.dict(exclude_unset=True).items():
        setattr(year, field, value)
    
    db.commit()
    db.refresh(year)
    
    return year

@router.delete("/years/{year_id}")
async def delete_academic_year(
    year_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Delete academic year (Director only)"""
    year = db.query(AcademicYear).filter(AcademicYear.id == year_id).first()
    if not year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic year not found"
        )
    
    # Check if year has associated data
    classes_count = db.query(Class).filter(Class.academic_year_id == year_id).count()
    if classes_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete academic year with associated classes"
        )
    
    db.delete(year)
    db.commit()
    
    return {"message": "Academic year deleted successfully"}

# Class Management
@router.get("/classes", response_model=List[ClassResponse])
async def get_classes(
    academic_year_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all classes for academic year"""
    query = db.query(Class)
    if academic_year_id:
        query = query.filter(Class.academic_year_id == academic_year_id)
    
    classes = query.all()
    return classes

@router.post("/classes", response_model=ClassResponse)
async def create_class(
    class_data: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new class"""
    new_class = Class(**class_data.dict())
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    
    return new_class

# Subject Management
@router.get("/subjects", response_model=List[SubjectResponse])
async def get_subjects(
    class_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all subjects for class"""
    query = db.query(Subject)
    if class_id:
        query = query.filter(Subject.class_id == class_id)
    
    subjects = query.all()
    return subjects

@router.post("/subjects", response_model=SubjectResponse)
async def create_subject(
    subject_data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new subject"""
    new_subject = Subject(**subject_data.dict())
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    
    return new_subject

@router.put("/subjects/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: int,
    subject_data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update subject"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    for field, value in subject_data.dict(exclude_unset=True).items():
        setattr(subject, field, value)
    
    db.commit()
    db.refresh(subject)
    
    return subject

@router.delete("/subjects/{subject_id}")
async def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete subject"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    db.delete(subject)
    db.commit()
    
    return {"message": "Subject deleted successfully"}
