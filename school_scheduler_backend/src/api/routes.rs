// Only include Tauri commands when the feature is enabled

// Only include Tauri commands when the feature is enabled
#[cfg(feature = "tauri")]
use tauri::State;

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn generate_schedules(
    class: Class,
    teachers: Vec<Teacher>,
    subjects: Vec<Subject>,
    constraints: Vec<Constraint>,
    count: usize,
    repo: State<'_, ScheduleRepository>,
) -> Result<Vec<Schedule>, ScheduleError> {
    let schedules = ScheduleGenerator::generate_multiple_schedules(
        &class, &teachers, &subjects, &constraints, count
    )?;
    
    // حفظ الجداول في قاعدة البيانات
    for schedule in &schedules {
        repo.save_schedule(schedule).await?;
    }
    
    Ok(schedules)
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn get_class_schedule(
    class_id: String,
    repo: State<'_, ScheduleRepository>,
) -> Result<Schedule, ScheduleError> {
    let uuid = Uuid::parse_str(&class_id)
        .map_err(|_| ScheduleError::InvalidUuid(class_id))?;
    
    repo.get_schedule(uuid).await
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn get_teacher_schedule(
    teacher_id: String,
    repo: State<'_, ScheduleRepository>,
) -> Result<Vec<crate::models::TeacherSchedule>, ScheduleError> {
    let uuid = Uuid::parse_str(&teacher_id)
        .map_err(|_| ScheduleError::InvalidUuid(teacher_id))?;
    
    repo.get_teacher_schedule(uuid).await
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn validate_schedule(
    schedule: Schedule,
    class: Class,
    teachers: Vec<Teacher>,
    subjects: Vec<Subject>,
    constraints: Vec<Constraint>,
) -> Result<String, ScheduleError> {
    ScheduleValidator::validate_schedule(
        &schedule, &class, &teachers, &subjects, &constraints
    )?;
    
    Ok("Schedule is valid".to_string())
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn check_conflicts(
    schedule: Schedule,
    teachers: Vec<Teacher>,
    constraints: Vec<Constraint>,
) -> Result<String, ScheduleError> {
    let conflicts = ConflictDetector::detect_conflicts(&schedule, &teachers, &constraints);
    
    if conflicts.is_empty() {
        Ok("No conflicts found".to_string())
    } else {
        let summary = ConflictDetector::get_conflict_summary(&schedule, &teachers, &constraints);
        Ok(summary)
    }
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn save_class(
    class: Class,
    repo: State<'_, ScheduleRepository>,
) -> Result<(), ScheduleError> {
    repo.save_class(&class).await
}

#[cfg(feature = "tauri")]
#[tauri::command]
pub async fn save_teacher(
    teacher: Teacher,
    repo: State<'_, ScheduleRepository>,
) -> Result<(), ScheduleError> {
    repo.save_teacher(&teacher).await
}