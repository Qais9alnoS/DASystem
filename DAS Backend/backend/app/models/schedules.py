from sqlalchemy import Column, Integer, String, Text, Boolean, Date, Numeric, ForeignKey, JSON, Time
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class TimeSlot(BaseModel):
    __tablename__ = "time_slots"
    
    period_number = Column(Integer, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    session_type = Column(String(10), nullable=False)  # morning, evening
    is_break = Column(Boolean, default=False)
    
class ScheduleAssignment(BaseModel):
    __tablename__ = "schedule_assignments"
    
    schedule_id = Column(Integer, ForeignKey("schedules.id"), nullable=False)
    time_slot_id = Column(Integer, ForeignKey("time_slots.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    
    # Relationships
    schedule = relationship("Schedule")
    time_slot = relationship("TimeSlot")
    teacher = relationship("Teacher")
    subject = relationship("Subject")
    class_rel = relationship("Class")

class ScheduleConflict(BaseModel):
    __tablename__ = "schedule_conflicts"
    
    schedule_assignment_id = Column(Integer, ForeignKey("schedule_assignments.id"), nullable=False)
    conflict_type = Column(String(50), nullable=False)  # teacher_overlap, room_overlap, etc.
    description = Column(Text)
    severity = Column(String(20), default="medium")  # low, medium, high, critical
    is_resolved = Column(Boolean, default=False)
    
    # Relationships
    schedule_assignment = relationship("ScheduleAssignment")

class Schedule(BaseModel):
    __tablename__ = "schedules"
    
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"), nullable=False)
    session_type = Column(String(10), nullable=False)  # morning, evening
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    section = Column(String(10))
    day_of_week = Column(Integer)  # 1-7 (Monday-Sunday)
    period_number = Column(Integer)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    
    # Relationships
    academic_year = relationship("AcademicYear")
    class_rel = relationship("Class", back_populates="schedules")
    subject = relationship("Subject")
    teacher = relationship("Teacher")

class ScheduleConstraint(BaseModel):
    __tablename__ = "schedule_constraints"
    
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"), nullable=False)
    constraint_type = Column(String(20), nullable=False)  # forbidden, required, no_consecutive, max_consecutive, min_consecutive
    
    # Target Specification
    class_id = Column(Integer, ForeignKey("classes.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    
    # Time Specification
    day_of_week = Column(Integer)  # 1-7 (Monday-Sunday), NULL for any day
    period_number = Column(Integer)  # 1-8, NULL for any period
    time_range_start = Column(Integer)  # For range constraints (e.g., periods 1-4)
    time_range_end = Column(Integer)
    
    # Consecutive Constraints
    max_consecutive_periods = Column(Integer)  # For consecutive constraints
    min_consecutive_periods = Column(Integer)
    
    # Advanced Options
    applies_to_all_sections = Column(Boolean, default=False)
    session_type = Column(String(10), default="both")  # morning, evening, both
    priority_level = Column(Integer, default=1)  # 1=Low, 2=Medium, 3=High, 4=Critical
    
    # Metadata
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    academic_year = relationship("AcademicYear")
    class_rel = relationship("Class")
    subject = relationship("Subject")
    teacher = relationship("Teacher")

class ConstraintTemplate(BaseModel):
    __tablename__ = "constraint_templates"
    
    template_name = Column(String(100), nullable=False)
    template_description = Column(Text)
    constraint_config = Column(JSON)  # Stores constraint configuration
    is_system_template = Column(Boolean, default=False)

class ScheduleGenerationHistory(BaseModel):
    __tablename__ = "schedule_generation_history"
    
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"), nullable=False)
    session_type = Column(String(10), nullable=False)  # morning, evening
    generation_algorithm = Column(String(50))  # 'genetic', 'backtrack', 'greedy'
    generation_parameters = Column(JSON)
    constraints_count = Column(Integer)
    conflicts_resolved = Column(Integer)
    generation_time_seconds = Column(Integer)
    quality_score = Column(Numeric(5,2))  # 0-100 rating of schedule quality
    status = Column(String(10), nullable=False)  # success, partial, failed
    error_message = Column(Text)
    
    # Relationships
    academic_year = relationship("AcademicYear")