use thiserror::Error;
use serde::Serialize;

#[derive(Debug, Error, Serialize)]
pub enum ScheduleError {
    #[error("تعارض في جدول المعلم: {teacher_name} في {day} حصة {period}")]
    TeacherConflict {
        teacher_name: String,
        day: u8,
        period: u8,
    },
    
    #[error("المادة {subject_name} تتطلب أكثر من الحصص المتاحة")]
    SubjectOverflow {
        subject_name: String,
    },
    
    #[error("قيود غير قابلة للتطبيق: {constraint_details}")]
    ImpossibleConstraints {
        constraint_details: String,
    },
    
    #[error("فشل في توليد الجدول: {0}")]
    GenerationFailed(String),
    
    #[error("قاعدة البيانات: {0}")]
    DatabaseError(String),
    
    #[error("خطأ في التحقق: {0}")]
    ValidationError(String),
    
    #[error("خطأ غير معروف: {0}")]
    Unknown(String),
    
    #[error("لا يوجد مدرس مناسب للمادة: {0}")]
    NoSuitableTeacher(String),
    
    #[error("لا توجد أوقات متاحة للمادة: {0}")]
    NoAvailableSlots(String),
    
    #[error("المادة مفقودة من الجدول: {0}")]
    MissingSubject(String),
    
    #[error("عدم تطابق ساعات المادة: {subject_id} - المطلوب: {required}, الفعلي: {actual}")]
    SubjectHoursMismatch {
        subject_id: String,
        required: u8,
        actual: u8,
    },
    
    #[error("المدرس غير متاح: {teacher_id} في اليوم {day} الحصة {period}")]
    TeacherNotAvailable {
        teacher_id: String,
        day: u8,
        period: u8,
    },
    
    #[error("المدرس غير موجود: {0}")]
    TeacherNotFound(String),
    
    #[error("انتهاك القيد: {0}")]
    ConstraintViolation(String),
    
    #[error("الجدول فارغ")]
    EmptySchedule,
    
    #[error("UUID غير صالح: {0}")]
    InvalidUuid(String),
    
    #[error("قيد غير صالح: {0}")]
    InvalidConstraint(String),
    
    #[error("تعارض في المعلم: {teacher_id} في الحصة {period}")]
    TeacherConflictSimple {
        teacher_id: String,
        period: u8,
    },
}

// Conversion from other error types
impl From<sqlx::Error> for ScheduleError {
    fn from(error: sqlx::Error) -> Self {
        ScheduleError::DatabaseError(error.to_string())
    }
}

impl From<serde_json::Error> for ScheduleError {
    fn from(error: serde_json::Error) -> Self {
        ScheduleError::Unknown(error.to_string())
    }
}

impl From<&str> for ScheduleError {
    fn from(error: &str) -> Self {
        ScheduleError::Unknown(error.to_string())
    }
}

impl From<String> for ScheduleError {
    fn from(error: String) -> Self {
        ScheduleError::Unknown(error)
    }
}