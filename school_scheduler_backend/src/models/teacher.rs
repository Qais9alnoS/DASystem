use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeSlot {
    pub day: u8,    // 1-5 (Sunday-Thursday)
    pub period: u8, // 1-6
    pub available: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Teacher {
    pub id: Uuid,
    pub name: String,
    pub subjects: Vec<Uuid>,          // IDs of subjects this teacher can teach
    pub available_slots: Vec<TimeSlot>,
    pub assigned_classes: Vec<Uuid>,  // IDs of classes this teacher is assigned to
}

impl Teacher {
    pub fn new(name: String, subjects: Vec<Uuid>) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            subjects,
            available_slots: Vec::new(),
            assigned_classes: Vec::new(),
        }
    }
    
    pub fn new_with_slots(name: String, subjects: Vec<Uuid>, available_slots: Vec<(u8, u8)>) -> Self {
        let mut teacher = Self::new(name, subjects);
        for (day, period) in available_slots {
            teacher.add_availability(day, period);
        }
        teacher
    }
    
    pub fn add_availability(&mut self, day: u8, period: u8) {
        self.available_slots.push(TimeSlot {
            day,
            period,
            available: true,
        });
    }
    
    pub fn is_available(&self, day: u8, period: u8) -> bool {
        self.available_slots.iter().any(|slot| 
            slot.day == day && slot.period == period && slot.available
        )
    }
    
    pub fn can_teach_subject(&self, subject_id: Uuid) -> bool {
        self.subjects.contains(&subject_id)
    }
    
    pub fn get_available_hours(&self) -> u8 {
        self.available_slots.iter()
            .filter(|slot| slot.available)
            .count() as u8
    }
}