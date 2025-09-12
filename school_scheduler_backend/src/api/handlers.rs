// Only include Tauri commands when the feature is enabled

// Only include Tauri commands when the feature is enabled
#[cfg(feature = "tauri")]
use tauri::State;

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn create_class(
    grade: u8,
    section: String,
    department: Option<String>,
    subjects: Vec<(Uuid, u8)>, // (subject_id, weekly_hours)
    repo: State<'_, ScheduleRepository>,
) -> Result<Class, ScheduleError> {
    let class = Class::new_with_subjects(grade, section, department, subjects);
    repo.save_class(&class).await?;
    Ok(class)
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn create_teacher(
    name: String,
    subjects: Vec<Uuid>,
    available_slots: Vec<(u8, u8)>, // (day, period)
    repo: State<'_, ScheduleRepository>,
) -> Result<Teacher, ScheduleError> {
    let teacher = Teacher::new_with_slots(name, subjects, available_slots);
    repo.save_teacher(&teacher).await?;
    Ok(teacher)
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn create_subject(
    name: String,
    weekly_hours: u8,
    grade_level: crate::models::GradeLevel,
    department: Option<crate::models::Department>,
) -> Result<Subject, ScheduleError> {
    let subject = Subject::new(name, weekly_hours, grade_level, department);
    Ok(subject)
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn create_constraint(
    constraint_type: crate::models::ConstraintType,
    subject_id: Option<Uuid>,
    teacher_id: Option<Uuid>,
    day: Option<u8>,
    period: Option<u8>,
    details: Option<String>,
) -> Result<Constraint, ScheduleError> {
    let constraint = match constraint_type {
        crate::models::ConstraintType::Forbidden => {
            if let (Some(subject_id), Some(day), Some(period)) = (subject_id, day, period) {
                Constraint::new_forbidden(subject_id, day, period)
            } else {
                return Err(ScheduleError::InvalidConstraint(
                    "Forbidden constraint requires subject_id, day, and period".to_string()
                ));
            }
        }
        crate::models::ConstraintType::Required => {
            if let (Some(subject_id), Some(day), Some(period)) = (subject_id, day, period) {
                Constraint::new_required(subject_id, day, period)
            } else {
                return Err(ScheduleError::InvalidConstraint(
                    "Required constraint requires subject_id, day, and period".to_string()
                ));
            }
        }
        crate::models::ConstraintType::Sequence => {
            if let Some(subject_id) = subject_id {
                Constraint::new_sequence(subject_id, details.unwrap_or_else(|| "".to_string()))
            } else {
                return Err(ScheduleError::InvalidConstraint(
                    "Sequence constraint requires subject_id".to_string()
                ));
            }
        }
    };
    
    Ok(constraint)
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn get_all_classes(
    _repo: State<'_, ScheduleRepository>,
) -> Result<Vec<Class>, ScheduleError> {
    // سيتم تطوير هذا لاحقًا لاسترجاع جميع الفصول من قاعدة البيانات
    Ok(Vec::new())
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn get_all_teachers(
    _repo: State<'_, ScheduleRepository>,
) -> Result<Vec<Teacher>, ScheduleError> {
    // سيتم تطوير هذا لاحقًا لاسترجاع جميع المدرسين من قاعدة البيانات
    Ok(Vec::new())
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn get_all_subjects() -> Result<Vec<Subject>, ScheduleError> {
    // سيتم تطوير هذا لاحقًا لاسترجاع جميع المواد من قاعدة البيانات
    Ok(Vec::new())
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn get_all_constraints() -> Result<Vec<Constraint>, ScheduleError> {
    // سيتم تطوير هذا لاحقًا لاسترجاع جميع القيود من قاعدة البيانات
    Ok(Vec::new())
}