use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConstraintType {
    Forbidden, // لا يمكن أن تكون المادة في وقت محدد
    Required,  // يجب أن تكون المادة في وقت محدد
    Sequence,  // قيود التتابع (مثل لا تظهر مرتين متتاليتين)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Constraint {
    pub id: Uuid,
    pub constraint_type: ConstraintType,
    pub subject_id: Option<Uuid>,
    pub teacher_id: Option<Uuid>,
    pub day: Option<u8>,        // 1-5 (الأحد-الخميس)
    pub period: Option<u8>,     // 1-6
    pub details: Option<String>, // تفاصيل إضافية للقيود
}

impl Constraint {
    pub fn new_forbidden(subject_id: Uuid, day: u8, period: u8) -> Self {
        Self {
            id: Uuid::new_v4(),
            constraint_type: ConstraintType::Forbidden,
            subject_id: Some(subject_id),
            teacher_id: None,
            day: Some(day),
            period: Some(period),
            details: None,
        }
    }
    
    pub fn new_required(subject_id: Uuid, day: u8, period: u8) -> Self {
        Self {
            id: Uuid::new_v4(),
            constraint_type: ConstraintType::Required,
            subject_id: Some(subject_id),
            teacher_id: None,
            day: Some(day),
            period: Some(period),
            details: None,
        }
    }
    
    pub fn new_sequence(subject_id: Uuid, details: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            constraint_type: ConstraintType::Sequence,
            subject_id: Some(subject_id),
            teacher_id: None,
            day: None,
            period: None,
            details: Some(details),
        }
    }
    
    pub fn applies_to(&self, subject_id: Uuid, day: u8, period: u8) -> bool {
        if let Some(subj_id) = self.subject_id {
            if subj_id != subject_id {
                return false;
            }
        }
        
        match self.constraint_type {
            ConstraintType::Forbidden | ConstraintType::Required => {
                self.day == Some(day) && self.period == Some(period)
            }
            ConstraintType::Sequence => true, // سيتم التعامل معه بشكل خاص
        }
    }
}