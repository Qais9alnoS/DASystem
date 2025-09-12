use crate::{
    error::ScheduleError,
    models::{Constraint, Schedule, Teacher},
};
use uuid::Uuid;

pub struct ConflictDetector;

impl ConflictDetector {
    pub fn detect_conflicts(
        schedule: &Schedule,
        teachers: &[Teacher],
        constraints: &[Constraint],
    ) -> Vec<ScheduleError> {
        let mut conflicts = Vec::new();

        // اكتشاف تعارضات المدرسين
        conflicts.extend(Self::detect_teacher_conflicts(schedule));

        // اكتشاف انتهاكات القيود
        conflicts.extend(Self::detect_constraint_violations(schedule, constraints));

        // اكتشاف مشاكل التوفر
        conflicts.extend(Self::detect_availability_issues(schedule, teachers));

        conflicts
    }

    fn detect_teacher_conflicts(schedule: &Schedule) -> Vec<ScheduleError> {
        let mut conflicts = Vec::new();

        // تتبع المدرسين في كل فترة
        for period in 1..=6 {
            let mut teachers_in_period = Vec::new();

            // جمع جميع المدرسين في هذه الفترة عبر الأيام
            for day in 1..=5 {
                if let Some(slot) = schedule.get_slot((day - 1) as usize, (period - 1) as usize) {
                    teachers_in_period.push((day as u8, slot.teacher_id));
                }
            }

            // التحقق من تعارض المدرسين (نفس المدرس في نفس الفترة في أيام مختلفة)
            let mut teacher_days: std::collections::HashMap<Uuid, Vec<u8>> =
                std::collections::HashMap::new();

            for (day, teacher_id) in &teachers_in_period {
                teacher_days.entry(*teacher_id).or_default().push(*day);
            }

            for (teacher_id, days) in teacher_days {
                if days.len() > 1 {
                    conflicts.push(ScheduleError::TeacherConflictSimple {
                        teacher_id: teacher_id.to_string(),
                        period: period as u8,
                    });
                }
            }
        }

        conflicts
    }

    fn detect_constraint_violations(
        schedule: &Schedule,
        constraints: &[Constraint],
    ) -> Vec<ScheduleError> {
        let mut violations = Vec::new();

        for constraint in constraints {
            match constraint.constraint_type {
                crate::models::ConstraintType::Forbidden => {
                    if let (Some(subject_id), Some(day), Some(period)) =
                        (constraint.subject_id, constraint.day, constraint.period)
                    {
                        if let Some(slot) =
                            schedule.get_slot((day - 1) as usize, (period - 1) as usize)
                        {
                            if slot.subject_id == subject_id {
                                violations.push(ScheduleError::ConstraintViolation(
                                    format!("Forbidden constraint violated: subject {} at day {}, period {}", 
                                           subject_id, day, period)
                                ));
                            }
                        }
                    }
                }
                crate::models::ConstraintType::Required => {
                    if let (Some(subject_id), Some(day), Some(period)) =
                        (constraint.subject_id, constraint.day, constraint.period)
                    {
                        match schedule.get_slot((day - 1) as usize, (period - 1) as usize) {
                            Some(slot) if slot.subject_id != subject_id => {
                                violations.push(ScheduleError::ConstraintViolation(
                                    format!("Required constraint violated: expected subject {} at day {}, period {}, found {}", 
                                           subject_id, day, period, slot.subject_id)
                                ));
                            }
                            None => {
                                violations.push(ScheduleError::ConstraintViolation(
                                format!("Required constraint violated: subject {} required at day {}, period {} but slot is empty", 
                                       subject_id, day, period)
                            ));
                            }
                            _ => {} // القيد محقق
                        }
                    }
                }
                crate::models::ConstraintType::Sequence => {
                    // سيتم تطويره لاحقًا لاكتشاف انتهاكات قيود التتابع
                }
            }
        }

        violations
    }

    fn detect_availability_issues(schedule: &Schedule, teachers: &[Teacher]) -> Vec<ScheduleError> {
        let mut issues = Vec::new();

        for day in 1..=5 {
            for period in 1..=6 {
                if let Some(slot) = schedule.get_slot((day - 1) as usize, (period - 1) as usize) {
                    if let Some(teacher) = teachers.iter().find(|t| t.id == slot.teacher_id) {
                        if !teacher.is_available(day as u8, period as u8) {
                            issues.push(ScheduleError::TeacherNotAvailable {
                                teacher_id: teacher.id.to_string(),
                                day: day as u8,
                                period: period as u8,
                            });
                        }
                    } else {
                        issues.push(ScheduleError::TeacherNotFound(slot.teacher_id.to_string()));
                    }
                }
            }
        }

        issues
    }

    pub fn has_conflicts(
        schedule: &Schedule,
        teachers: &[Teacher],
        constraints: &[Constraint],
    ) -> bool {
        !Self::detect_conflicts(schedule, teachers, constraints).is_empty()
    }

    pub fn get_conflict_summary(
        schedule: &Schedule,
        teachers: &[Teacher],
        constraints: &[Constraint],
    ) -> String {
        let conflicts = Self::detect_conflicts(schedule, teachers, constraints);

        if conflicts.is_empty() {
            "No conflicts detected".to_string()
        } else {
            let mut summary = format!("Found {} conflicts:\n", conflicts.len());

            for conflict in conflicts {
                summary.push_str(&format!("- {}\n", conflict));
            }

            summary
        }
    }
}
