use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassSubject {
    pub subject_id: Uuid,
    pub weekly_hours: u8,
    pub is_required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Class {
    pub id: Uuid,
    pub grade: u8,
    pub section: String,      // "أ", "ب", "صبيان", "بنات", إلخ
    pub department: Option<String>, // "علمي", "أدبي"
    pub subjects: Vec<ClassSubject>,
}

impl Class {
    pub fn new(grade: u8, section: String, department: Option<String>) -> Self {
        Self {
            id: Uuid::new_v4(),
            grade,
            section,
            department,
            subjects: Vec::new(),
        }
    }
    
    pub fn new_with_subjects(grade: u8, section: String, department: Option<String>, subjects: Vec<(uuid::Uuid, u8)>) -> Self {
        let mut class = Self::new(grade, section, department);
        for (subject_id, weekly_hours) in subjects {
            class.add_subject(subject_id, weekly_hours, true);
        }
        class
    }
    
    pub fn add_subject(&mut self, subject_id: Uuid, weekly_hours: u8, is_required: bool) {
        self.subjects.push(ClassSubject {
            subject_id,
            weekly_hours,
            is_required,
        });
    }
    
    pub fn get_total_hours(&self) -> u8 {
        self.subjects.iter().map(|s| s.weekly_hours).sum()
    }
    
    pub fn get_required_subjects(&self) -> Vec<&ClassSubject> {
        self.subjects.iter().filter(|s| s.is_required).collect()
    }
    
    pub fn get_subject_hours(&self, subject_id: Uuid) -> Option<u8> {
        self.subjects.iter()
            .find(|s| s.subject_id == subject_id)
            .map(|s| s.weekly_hours)
    }
}