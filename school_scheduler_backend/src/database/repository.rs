use crate::{
    error::ScheduleError,
    models::{Class, Schedule, Teacher},
};
use sqlx::{Row, SqlitePool, sqlite::SqlitePoolOptions};
use uuid::Uuid;

pub struct ScheduleRepository {
    pool: SqlitePool,
}

impl ScheduleRepository {
    pub async fn new() -> Result<Self, ScheduleError> {
        let pool = SqlitePoolOptions::new()
            .connect("sqlite:schedules.db")
            .await?;

        Ok(Self { pool })
    }

    pub async fn save_schedule(&self, schedule: &Schedule) -> Result<(), ScheduleError> {
        let schedule_json = serde_json::to_string(schedule)?;

        sqlx::query(
            "INSERT OR REPLACE INTO schedules (id, class_id, schedule_data) VALUES (?, ?, ?)",
        )
        .bind(schedule.id.to_string())
        .bind(schedule.class_id.to_string())
        .bind(schedule_json)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_schedule(&self, class_id: Uuid) -> Result<Schedule, ScheduleError> {
        let record = sqlx::query("SELECT schedule_data FROM schedules WHERE class_id = ?")
            .bind(class_id.to_string())
            .fetch_one(&self.pool)
            .await?;

        let schedule_data: String = record.get::<String, _>(0);
        let schedule: Schedule = serde_json::from_str(&schedule_data)?;
        Ok(schedule)
    }

    pub async fn get_teacher_schedule(
        &self,
        teacher_id: Uuid,
    ) -> Result<Vec<crate::models::TeacherSchedule>, ScheduleError> {
        let records = sqlx::query("SELECT schedule_data FROM schedules")
            .fetch_all(&self.pool)
            .await?;

        let mut teacher_schedules = Vec::new();

        for record in records {
            let schedule_data: String = record.get::<String, _>(0);
            let schedule: Schedule = serde_json::from_str(&schedule_data)?;

            for (day, day_schedule) in schedule.week_schedule.iter().enumerate() {
                for (period, slot) in day_schedule.iter().enumerate() {
                    if let Some(slot) = slot {
                        if slot.teacher_id == teacher_id {
                            teacher_schedules.push(crate::models::TeacherSchedule {
                                class_id: schedule.class_id,
                                day: day as u8,
                                period: period as u8,
                                subject_id: slot.subject_id,
                            });
                        }
                    }
                }
            }
        }

        Ok(teacher_schedules)
    }

    pub async fn save_class(&self, class: &Class) -> Result<(), ScheduleError> {
        let class_json = serde_json::to_string(class)?;

        sqlx::query(
            "INSERT OR REPLACE INTO classes (id, grade, section, department, subjects) VALUES (?, ?, ?, ?, ?)")
            .bind(class.id.to_string())
            .bind(class.grade)
            .bind(&class.section)
            .bind(&class.department)
            .bind(class_json)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn save_teacher(&self, teacher: &Teacher) -> Result<(), ScheduleError> {
        let _teacher_json = serde_json::to_string(teacher)?;

        sqlx::query(
            "INSERT OR REPLACE INTO teachers (id, name, subjects, available_slots, assigned_classes) VALUES (?, ?, ?, ?, ?)")
            .bind(teacher.id.to_string())
            .bind(&teacher.name)
            .bind(serde_json::to_string(&teacher.subjects)?)
            .bind(serde_json::to_string(&teacher.available_slots)?)
            .bind(serde_json::to_string(&teacher.assigned_classes)?)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}
