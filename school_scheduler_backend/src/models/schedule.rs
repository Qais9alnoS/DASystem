use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduleSlot {
    pub subject_id: Uuid,
    pub teacher_id: Uuid,
    pub room: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Schedule {
    pub id: Uuid,
    pub class_id: Uuid,
    pub week_schedule: [[Option<ScheduleSlot>; 6]; 5], // 5 أيام × 6 حصص
    pub generated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeacherSchedule {
    pub class_id: Uuid,
    pub day: u8,
    pub period: u8,
    pub subject_id: Uuid,
}

impl Schedule {
    pub fn new(class_id: Uuid) -> Self {
        Self {
            id: Uuid::new_v4(),
            class_id,
            week_schedule: Default::default(),
            generated_at: chrono::Utc::now(),
        }
    }
    
    pub fn assign_slot(&mut self, day: usize, period: usize, slot: ScheduleSlot) -> Result<(), &'static str> {
        if day >= 5 || period >= 6 {
            return Err("مؤشرات الوقت خارج النطاق المسموح");
        }
        
        self.week_schedule[day][period] = Some(slot);
        Ok(())
    }
    
    pub fn get_slot(&self, day: usize, period: usize) -> Option<&ScheduleSlot> {
        if day < 5 && period < 6 {
            self.week_schedule[day][period].as_ref()
        } else {
            None
        }
    }
    
    pub fn is_slot_empty(&self, day: usize, period: usize) -> bool {
        self.get_slot(day, period).is_none()
    }
    
    pub fn get_teacher_assignments(&self, teacher_id: Uuid) -> Vec<(usize, usize)> {
        let mut assignments = Vec::new();
        
        for (day, day_schedule) in self.week_schedule.iter().enumerate() {
            for (period, slot) in day_schedule.iter().enumerate() {
                if let Some(slot) = slot {
                    if slot.teacher_id == teacher_id {
                        assignments.push((day, period));
                    }
                }
            }
        }
        
        assignments
    }
    
    pub fn validate(&self) -> Result<(), &'static str> {
        // التحقق من عدم وجود تعارضات أساسية
        for day in 0..5 {
            for period in 0..6 {
                if let Some(_slot) = &self.week_schedule[day][period] {
                    // يمكن إضافة المزيد من التحقق هنا
                }
            }
        }
        Ok(())
    }
}