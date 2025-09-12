use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};
use crate::error::ScheduleError;

pub async fn init_database(db_path: &str) -> Result<SqlitePool, ScheduleError> {
    let pool = SqlitePoolOptions::new()
        .connect(db_path)
        .await?;
    
    // إنشاء الجداول إذا لم تكن موجودة
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS subjects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            weekly_hours INTEGER NOT NULL,
            grade_level TEXT NOT NULL,
            department TEXT
        )"#
    )
    .execute(&pool)
    .await?;
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS teachers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            subjects TEXT NOT NULL,
            available_slots TEXT NOT NULL,
            assigned_classes TEXT NOT NULL
        )"#
    )
    .execute(&pool)
    .await?;
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS classes (
            id TEXT PRIMARY KEY,
            grade INTEGER NOT NULL,
            section TEXT NOT NULL,
            department TEXT,
            subjects TEXT NOT NULL
        )"#
    )
    .execute(&pool)
    .await?;
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS schedules (
            id TEXT PRIMARY KEY,
            class_id TEXT NOT NULL,
            schedule_data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (class_id) REFERENCES classes (id)
        )"#
    )
    .execute(&pool)
    .await?;
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS constraints (
            id TEXT PRIMARY KEY,
            constraint_type TEXT NOT NULL,
            subject_id TEXT,
            teacher_id TEXT,
            day INTEGER,
            period INTEGER,
            details TEXT
        )"#
    )
    .execute(&pool)
    .await?;
    
    Ok(pool)
}