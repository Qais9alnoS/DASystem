"""
Director Dashboard API Endpoints
Provides comprehensive dashboard statistics and overview for director users
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models.users import User
from ..models.academic import AcademicYear, Class, Subject
from ..models.students import Student
from ..models.teachers import Teacher
from ..models.activities import Activity
from ..models.finance import FinanceTransaction, FinanceCategory
from ..core.dependencies import get_director_user

router = APIRouter(tags=["Director Dashboard"])

@router.get("/dashboard")
async def get_director_dashboard(
    current_user: User = Depends(get_director_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard statistics for director"""
    try:
        # Get current active academic year
        current_academic_year = db.query(AcademicYear).filter(
            AcademicYear.is_active == True
        ).first()
        
        academic_year_id = current_academic_year.id if current_academic_year else None
        
        # Student Statistics
        total_students_query = db.query(Student)
        if academic_year_id:
            total_students_query = total_students_query.filter(
                Student.academic_year_id == academic_year_id
            )
        total_students = total_students_query.count()
        
        # Teacher Statistics
        total_teachers_query = db.query(Teacher)
        if academic_year_id:
            total_teachers_query = total_teachers_query.filter(
                Teacher.academic_year_id == academic_year_id
            )
        total_teachers = total_teachers_query.count()
        
        # Class Statistics
        total_classes_query = db.query(Class)
        if academic_year_id:
            total_classes_query = total_classes_query.filter(
                Class.academic_year_id == academic_year_id
            )
        total_classes = total_classes_query.count()
        
        # Subject Statistics (need to join with Class since Subject doesn't have academic_year_id directly)
        total_subjects_query = db.query(Subject)
        if academic_year_id:
            total_subjects_query = total_subjects_query.join(Class).filter(
                Class.academic_year_id == academic_year_id
            )
        total_subjects = total_subjects_query.count()
        
        # Activity Statistics
        active_activities_query = db.query(Activity)
        if academic_year_id:
            active_activities_query = active_activities_query.filter(
                and_(
                    Activity.academic_year_id == academic_year_id,
                    Activity.is_active == True
                )
            )
        active_activities = active_activities_query.count()
        
        # Financial Statistics (Monthly Revenue)
        monthly_revenue = 0
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        revenue_query = db.query(func.sum(FinanceTransaction.amount))
        revenue_filters = [
            FinanceTransaction.transaction_type == "income",
            FinanceTransaction.transaction_date >= thirty_days_ago
        ]
        
        if academic_year_id:
            revenue_filters.append(FinanceTransaction.academic_year_id == academic_year_id)
            
        revenue_query = revenue_query.filter(and_(*revenue_filters))
        revenue_result = revenue_query.scalar()
        monthly_revenue = float(revenue_result) if revenue_result else 0
        
        # Rewards and Assistance (Placeholder - would need director_notes table)
        total_rewards = 0
        total_assistance = 0
        
        # Recent activities (Placeholder)
        recent_activities = []
        
        return {
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_classes": total_classes,
            "total_subjects": total_subjects,
            "monthly_revenue": monthly_revenue,
            "active_activities": active_activities,
            "total_rewards": total_rewards,
            "total_assistance": total_assistance,
            "recent_activities": recent_activities
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch dashboard statistics: {str(e)}"
        )

# Additional director endpoints for notes, rewards, assistance, etc.
# These would be implemented based on the director_notes, director_rewards, etc. tables