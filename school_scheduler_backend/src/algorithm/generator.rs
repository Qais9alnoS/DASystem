use crate::{
    error::ScheduleError,
    models::{Class, Constraint, Schedule, Subject, Teacher},
};
use rand::{seq::SliceRandom, thread_rng};
use uuid::Uuid;

pub struct ScheduleGenerator;

impl ScheduleGenerator {
    pub fn new(
        _classes: Vec<Class>,
        _teachers: Vec<Teacher>,
        _constraints: Vec<Constraint>,
    ) -> Self {
        ScheduleGenerator
    }

    pub async fn generate(&self) -> Result<Vec<Schedule>, ScheduleError> {
        // Implementation placeholder - will be developed
        Ok(vec![])
    }

    pub fn generate_schedule(
        class: &Class,
        teachers: &[Teacher],
        _subjects: &[Subject],
        constraints: &[Constraint],
    ) -> Result<Schedule, ScheduleError> {
        let mut schedule = Schedule::new(class.id);
        let mut rng = thread_rng();

        // إنشاء قائمة بالمواد المطلوبة مع ساعاتها
        let mut required_subjects: Vec<(Uuid, u8)> = class
            .subjects
            .iter()
            .map(|cs| (cs.subject_id, cs.weekly_hours))
            .collect();

        // خلط المواد عشوائيًا لتوزيع أفضل
        required_subjects.shuffle(&mut rng);

        // محاولة تعيين كل مادة في الجدول
        for (subject_id, required_hours) in required_subjects {
            let mut assigned_hours = 0;

            while assigned_hours < required_hours {
                // العثور على مدرس مناسب للمادة
                let suitable_teachers: Vec<&Teacher> = teachers
                    .iter()
                    .filter(|t| t.can_teach_subject(subject_id))
                    .collect();

                if suitable_teachers.is_empty() {
                    return Err(ScheduleError::NoSuitableTeacher(subject_id.to_string()));
                }

                // اختيار مدرس عشوائي من المناسبين
                let teacher = suitable_teachers
                    .choose(&mut rng)
                    .ok_or_else(|| ScheduleError::NoSuitableTeacher(subject_id.to_string()))?;

                // العثور على وقت فارغ مناسب
                let mut found_slot = false;

                for day in 1..=5 {
                    for period in 1..=6 {
                        if schedule.is_slot_empty(day as usize, period as usize)
                            && teacher.is_available(day, period)
                            && !Self::violates_constraints(
                                subject_id,
                                teacher.id,
                                day,
                                period,
                                constraints,
                            )
                        {
                            let slot = crate::models::ScheduleSlot {
                                subject_id,
                                teacher_id: teacher.id,
                                room: None,
                            };
                            schedule.assign_slot(day as usize, period as usize, slot)?;
                            assigned_hours += 1;
                            found_slot = true;
                            break;
                        }
                    }
                    if found_slot {
                        break;
                    }
                }

                if !found_slot && assigned_hours < required_hours {
                    return Err(ScheduleError::NoAvailableSlots(subject_id.to_string()));
                }
            }
        }

        Ok(schedule)
    }

    fn violates_constraints(
        subject_id: Uuid,
        _teacher_id: Uuid,
        day: u8,
        period: u8,
        constraints: &[Constraint],
    ) -> bool {
        constraints.iter().any(|constraint| {
            match constraint.constraint_type {
                crate::models::ConstraintType::Forbidden => {
                    constraint.applies_to(subject_id, day, period)
                }
                crate::models::ConstraintType::Required => {
                    // إذا كانت مطلوبة في وقت آخر، فهذا يعتبر انتهاكًا
                    constraint.subject_id == Some(subject_id)
                        && (constraint.day != Some(day) || constraint.period != Some(period))
                }
                crate::models::ConstraintType::Sequence => {
                    // التحقق من قيود التتابع (سيتم تطويره لاحقًا)
                    false
                }
            }
        })
    }

    pub fn generate_multiple_schedules(
        class: &Class,
        teachers: &[Teacher],
        subjects: &[Subject],
        constraints: &[Constraint],
        count: usize,
    ) -> Result<Vec<Schedule>, ScheduleError> {
        let mut schedules = Vec::new();

        for _ in 0..count {
            match Self::generate_schedule(class, teachers, subjects, constraints) {
                Ok(schedule) => schedules.push(schedule),
                Err(_e) => {
                    // تجاهل الجداول الفاشلة والاستمرار في المحاولة
                    continue;
                }
            }
        }

        if schedules.is_empty() {
            Err(ScheduleError::GenerationFailed(
                "Failed to generate any valid schedules".to_string(),
            ))
        } else {
            Ok(schedules)
        }
    }
}
