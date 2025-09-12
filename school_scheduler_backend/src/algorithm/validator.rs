use crate::{
    error::ScheduleError,
    models::{Class, Constraint, Schedule, Subject, Teacher},
};
use uuid::Uuid;

pub struct ScheduleValidator;

impl ScheduleValidator {
    pub fn validate_schedule(
        schedule: &Schedule,
        class: &Class,
        teachers: &[Teacher],
        _subjects: &[Subject],
        constraints: &[Constraint],
    ) -> Result<(), ScheduleError> {
        // 1. التحقق من أن جميع المواد المطلوبة موجودة
        Self::validate_required_subjects(schedule, class)?;

        // 2. التحقق من ساعات المواد
        Self::validate_subject_hours(schedule, class)?;

        // 3. التحقق من توفر المدرسين
        Self::validate_teacher_availability(schedule, teachers)?;

        // 4. التحقق من عدم وجود تعارضات بين المدرسين
        Self::validate_teacher_conflicts(schedule)?;

        // 5. التحقق من القيود
        Self::validate_constraints(schedule, constraints)?;

        // 6. التحقق من الجدول العام
        Self::validate_schedule_structure(schedule)?;

        Ok(())
    }

    fn validate_required_subjects(schedule: &Schedule, class: &Class) -> Result<(), ScheduleError> {
        let required_subjects: Vec<Uuid> = class.subjects.iter().map(|cs| cs.subject_id).collect();

        for required_subject in &required_subjects {
            let mut found = false;

            for day in 1..=5 {
                for period in 1..=6 {
                    if let Some(slot) = schedule.get_slot((day - 1) as usize, (period - 1) as usize) {
                        if slot.subject_id == *required_subject {
                            found = true;
                            break;
                        }
                    }
                }
                if found {
                    break;
                }
            }

            if !found {
                return Err(ScheduleError::MissingSubject(required_subject.to_string()));
            }
        }

        Ok(())
    }

    fn validate_subject_hours(schedule: &Schedule, class: &Class) -> Result<(), ScheduleError> {
        for class_subject in &class.subjects {
            let mut actual_hours = 0;

            for day in 1..=5 {
                for period in 1..=6 {
                    if let Some(slot) = schedule.get_slot((day - 1) as usize, (period - 1) as usize) {
                        if slot.subject_id == class_subject.subject_id {
                            actual_hours += 1;
                        }
                    }
                }
            }

            if actual_hours != class_subject.weekly_hours {
                return Err(ScheduleError::SubjectHoursMismatch {
                    subject_id: class_subject.subject_id.to_string(),
                    required: class_subject.weekly_hours,
                    actual: actual_hours,
                });
            }
        }

        Ok(())
    }

    fn validate_teacher_availability(
        schedule: &Schedule,
        teachers: &[Teacher],
    ) -> Result<(), ScheduleError> {
        for day in 1..=5 {
            for period in 1..=6 {
                if let Some(slot) = schedule.get_slot((day - 1) as usize, (period - 1) as usize) {
                    let teacher = teachers
                        .iter()
                        .find(|t| t.id == slot.teacher_id)
                        .ok_or_else(|| {
                            ScheduleError::TeacherNotFound(slot.teacher_id.to_string())
                        })?;

                    if !teacher.is_available(day as u8, period as u8) {
                        return Err(ScheduleError::TeacherNotAvailable {
                            teacher_id: teacher.id.to_string(),
                            day: day as u8,
                            period: period as u8,
                        });
                    }
                }
            }
        }

        Ok(())
    }

    fn validate_teacher_conflicts(schedule: &Schedule) -> Result<(), ScheduleError> {
        for day in 1..=5 {
            for period in 1..=6 {
                if let Some(slot) = schedule.get_slot((day - 1) as usize, (period - 1) as usize) {
                    // التحقق من أن المدرس ليس معينًا في وقت آخر في نفس الفترة
                    for other_day in 1..=5 {
                        if other_day != day {
                            if let Some(other_slot) = schedule.get_slot((other_day - 1) as usize, (period - 1) as usize) {
                                if other_slot.teacher_id == slot.teacher_id {
                                    return Err(ScheduleError::TeacherConflict {
                                        teacher_name: slot.teacher_id.to_string(),
                                        day: other_day as u8,
                                        period: period as u8,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        Ok(())
    }

    fn validate_constraints(
        schedule: &Schedule,
        constraints: &[Constraint],
    ) -> Result<(), ScheduleError> {
        for constraint in constraints {
            match constraint.constraint_type {
                crate::models::ConstraintType::Forbidden => {
                    if let (Some(subject_id), Some(day), Some(period)) =
                        (constraint.subject_id, constraint.day, constraint.period)
                    {
                        if let Some(slot) = schedule.get_slot((day - 1) as usize, (period - 1) as usize) {
                            if slot.subject_id == subject_id {
                                return Err(ScheduleError::ConstraintViolation(format!(
                                    "Forbidden constraint for subject {} at day {}, period {}",
                                    subject_id, day, period
                                )));
                            }
                        }
                    }
                }
                crate::models::ConstraintType::Required => {
                    if let (Some(subject_id), Some(day), Some(period)) =
                        (constraint.subject_id, constraint.day, constraint.period)
                    {
                        if let Some(slot) = schedule.get_slot((day - 1) as usize, (period - 1) as usize) {
                            if slot.subject_id != subject_id {
                                return Err(ScheduleError::ConstraintViolation(format!(
                                    "Required constraint not met for subject {} at day {}, period {}",
                                    subject_id, day, period
                                )));
                            }
                        } else {
                            return Err(ScheduleError::ConstraintViolation(format!(
                                "Required constraint not met for subject {} at day {}, period {} (empty slot)",
                                subject_id, day, period
                            )));
                        }
                    }
                }
                crate::models::ConstraintType::Sequence => {
                    // سيتم تطويره لاحقًا للتحقق من قيود التتابع
                }
            }
        }

        Ok(())
    }

    fn validate_schedule_structure(schedule: &Schedule) -> Result<(), ScheduleError> {
        // التحقق من أن الجدول ليس فارغًا تمامًا
        let mut _total_slots = 0;
        let mut filled_slots = 0;

        for day in 1..=5 {
            for period in 1..=6 {
                _total_slots += 1;
                if schedule.get_slot((day - 1) as usize, (period - 1) as usize).is_some() {
                    filled_slots += 1;
                }
            }
        }

        if filled_slots == 0 {
            return Err(ScheduleError::EmptySchedule);
        }

        Ok(())
    }
}
