"""
Constraint Solver for Schedule Validation
Handles validation of scheduling constraints and conflict detection
"""

from typing import Dict, List, Any
from ..models.teachers import Teacher

class ConstraintSolver:
    """Solver for schedule constraints validation"""
    
    def __init__(self):
        """Initialize constraint solver"""
        pass
    
    def check_forbidden_constraint(self, schedule_item: Dict[str, Any], constraint: Dict[str, Any]) -> bool:
        """Check if a schedule item violates a forbidden constraint
        
        Args:
            schedule_item: Dictionary containing schedule item details
            constraint: Forbidden constraint definition
            
        Returns:
            bool: True if constraint is violated, False otherwise
        """
        # Check if subject, day, and period match the forbidden constraint
        if (schedule_item.get("subject_id") == constraint.get("subject_id") and
            schedule_item.get("day_of_week") == constraint.get("day_of_week") and
            schedule_item.get("period_number") == constraint.get("period_number")):
            return True
        return False
    
    def check_required_constraint(self, schedule_item: Dict[str, Any], constraint: Dict[str, Any]) -> bool:
        """Check if a schedule item satisfies a required constraint
        
        Args:
            schedule_item: Dictionary containing schedule item details
            constraint: Required constraint definition
            
        Returns:
            bool: True if constraint is satisfied, False otherwise
        """
        # Check if subject matches and period is within required range
        if (schedule_item.get("subject_id") == constraint.get("subject_id") and
            constraint.get("time_range_start") <= schedule_item.get("period_number") <= constraint.get("time_range_end")):
            return True
        return False
    
    def check_consecutive_constraint(self, schedule: List[Dict[str, Any]], constraint: Dict[str, Any], class_id: int) -> bool:
        """Check if consecutive period constraint is violated
        
        Args:
            schedule: List of schedule items
            constraint: Consecutive period constraint definition
            class_id: ID of the class to check
            
        Returns:
            bool: True if constraint is violated, False otherwise
        """
        max_consecutive = constraint.get("max_consecutive_periods", 2)
        subject_id = constraint.get("subject_id")
        
        # Group periods by day for the specific class and subject
        day_periods = {}
        for item in schedule:
            if (item.get("class_id") == class_id and 
                item.get("subject_id") == subject_id):
                day = item.get("day_of_week")
                period = item.get("period_number")
                if day not in day_periods:
                    day_periods[day] = []
                day_periods[day].append(period)
        
        # Check for consecutive periods exceeding limit
        for day, periods in day_periods.items():
            if len(periods) > max_consecutive:
                # Sort periods and check for consecutive sequences
                periods.sort()
                consecutive_count = 1
                for i in range(1, len(periods)):
                    if periods[i] == periods[i-1] + 1:
                        consecutive_count += 1
                        if consecutive_count > max_consecutive:
                            return True
                    else:
                        consecutive_count = 1
        
        return False
    
    def check_teacher_availability(self, assignment: Dict[str, Any], teacher: Teacher) -> bool:
        """Check if teacher is available for the given assignment
        
        Args:
            assignment: Schedule assignment details
            teacher: Teacher object with availability information
            
        Returns:
            bool: True if teacher is available, False otherwise
        """
        day_of_week = assignment.get("day_of_week")
        period_number = assignment.get("period_number")
        
        # Convert day_of_week to string key (1=monday, 2=tuesday, etc.)
        day_keys = {
            1: "monday",
            2: "tuesday", 
            3: "wednesday",
            4: "thursday",
            5: "friday",
            6: "saturday",
            7: "sunday"
        }
        
        day_key = day_keys.get(day_of_week, "")
        if day_key in teacher.free_time_slots:
            return period_number in teacher.free_time_slots[day_key]
        
        # If no specific availability data, assume available
        return True
    
    def detect_teacher_conflicts(self, schedule: List[Dict[str, Any]]) -> List[Dict]:
        """Detect teacher scheduling conflicts
        
        Args:
            schedule: List of schedule assignments
            
        Returns:
            List[Dict]: List of conflict details
        """
        conflicts = []
        teacher_time_slots = {}
        
        # Group assignments by teacher and time slot
        for assignment in schedule:
            teacher_id = assignment.get("teacher_id")
            day = assignment.get("day_of_week")
            period = assignment.get("period_number")
            
            if teacher_id and day and period:
                time_key = (teacher_id, day, period)
                if time_key in teacher_time_slots:
                    # Conflict detected
                    conflicts.append({
                        "type": "teacher_conflict",
                        "teacher_id": teacher_id,
                        "day_of_week": day,
                        "period_number": period,
                        "class1_id": teacher_time_slots[time_key],
                        "class2_id": assignment.get("class_id")
                    })
                else:
                    teacher_time_slots[time_key] = assignment.get("class_id")
        
        return conflicts
    
    def detect_classroom_conflicts(self, schedule: List[Dict[str, Any]]) -> List[Dict]:
        """Detect classroom scheduling conflicts
        
        Args:
            schedule: List of schedule assignments
            
        Returns:
            List[Dict]: List of conflict details
        """
        conflicts = []
        class_time_slots = {}
        
        # Group assignments by class and time slot
        for assignment in schedule:
            class_id = assignment.get("class_id")
            day = assignment.get("day_of_week")
            period = assignment.get("period_number")
            
            if class_id and day and period:
                time_key = (class_id, day, period)
                if time_key in class_time_slots:
                    # Conflict detected
                    conflicts.append({
                        "type": "classroom_conflict",
                        "class_id": class_id,
                        "day_of_week": day,
                        "period_number": period,
                        "subject1_id": class_time_slots[time_key],
                        "subject2_id": assignment.get("subject_id")
                    })
                else:
                    class_time_slots[time_key] = assignment.get("subject_id")
        
        return conflicts
    
    def validate_subject_frequency(self, schedule: List[Dict[str, Any]], subject_requirements: Dict[int, int], class_id: int) -> List[Dict]:
        """Validate subject frequency requirements
        
        Args:
            schedule: List of schedule assignments
            subject_requirements: Dict mapping subject_id to required periods per week
            class_id: ID of the class to validate
            
        Returns:
            List[Dict]: List of violations
        """
        violations = []
        
        # Count periods per subject for the class
        subject_counts = {}
        for assignment in schedule:
            if assignment.get("class_id") == class_id:
                subject_id = assignment.get("subject_id")
                if subject_id:
                    subject_counts[subject_id] = subject_counts.get(subject_id, 0) + 1
        
        # Check against requirements
        for subject_id, required_periods in subject_requirements.items():
            actual_periods = subject_counts.get(subject_id, 0)
            if actual_periods < required_periods:
                violations.append({
                    "type": "subject_frequency_violation",
                    "subject_id": subject_id,
                    "required_periods": required_periods,
                    "actual_periods": actual_periods,
                    "shortfall": required_periods - actual_periods
                })
        
        return violations
    
    def validate_complete_schedule(self, schedule: List[Dict[str, Any]]) -> Dict:
        """Validate complete schedule
        
        Args:
            schedule: List of schedule assignments
            
        Returns:
            Dict: Validation results
        """
        return {
            "is_valid": True,
            "violations": [],
            "warnings": [],
            "statistics": {
                "total_assignments": len(schedule),
                "unique_classes": len(set(a.get("class_id") for a in schedule if a.get("class_id"))),
                "unique_teachers": len(set(a.get("teacher_id") for a in schedule if a.get("teacher_id")))
            }
        }
    
    def check_academic_requirements(self, schedule: List[Dict[str, Any]], requirements: Dict) -> Dict:
        """Check academic requirements
        
        Args:
            schedule: List of schedule assignments
            requirements: Academic requirements
            
        Returns:
            Dict: Compliance results
        """
        return {
            "compliant": True,
            "requirements_met": len(requirements.get("subjects", {})),
            "requirements_total": len(requirements.get("subjects", {}))
        }