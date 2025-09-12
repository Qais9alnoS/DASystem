use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GradeLevel {
    Primary(u8),    // Primary grades 1-6
    Intermediate(u8), // Intermediate grades 7-9
    Secondary(u8),   // Secondary grades 10-12
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Department {
    Scientific,
    Literary,
    General,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subject {
    pub id: Uuid,
    pub name: String,
    pub weekly_hours: u8,
    pub grade_level: GradeLevel,
    pub department: Option<Department>,
}

impl Subject {
    pub fn new(
        name: String,
        weekly_hours: u8,
        grade_level: GradeLevel,
        department: Option<Department>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            weekly_hours,
            grade_level,
            department,
        }
    }
    
    pub fn is_compatible_with_grade(&self, grade: u8) -> bool {
        match self.grade_level {
            GradeLevel::Primary(g) => (1..=6).contains(&grade) && g == grade,
            GradeLevel::Intermediate(g) => (7..=9).contains(&grade) && g == grade,
            GradeLevel::Secondary(g) => (10..=12).contains(&grade) && g == grade,
        }
    }
}