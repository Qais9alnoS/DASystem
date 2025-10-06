from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from ..database import get_db
from ..models.users import User
from ..core.dependencies import get_current_user, get_director_user
from ..services.backup_service import backup_service
from ..services.telegram_service import telegram_service, notify_system
from ..schemas.system import (
    BackupRequest,
    BackupResponse,
    BackupListResponse,
    NotificationRequest,
    NotificationResponse,
    SystemStatsResponse,
    TelegramTestResponse
)

router = APIRouter(prefix="/system", tags=["system"])

# Backup Endpoints
@router.post("/backup/database", response_model=BackupResponse)
async def create_database_backup(
    backup_request: BackupRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Create database backup (Director only)"""
    try:
        result = backup_service.create_database_backup(backup_request.backup_name)
        
        if result["success"]:
            # Send notification in background
            background_tasks.add_task(
                notify_system,
                "Database Backup",
                f"Database backup '{result['backup_name']}' created successfully",
                "success"
            )
        
        return BackupResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

@router.post("/backup/files", response_model=BackupResponse)
async def create_files_backup(
    backup_request: BackupRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Create files backup (Director only)"""
    try:
        result = backup_service.create_files_backup(backup_request.backup_name)
        
        if result["success"]:
            background_tasks.add_task(
                notify_system,
                "Files Backup",
                f"Files backup '{result['backup_name']}' created successfully",
                "success"
            )
        
        return BackupResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

@router.post("/backup/full", response_model=BackupResponse)
async def create_full_backup(
    backup_request: BackupRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Create full system backup (Director only)"""
    try:
        result = backup_service.create_full_backup(backup_request.backup_name)
        
        if result["success"]:
            background_tasks.add_task(
                notify_system,
                "Full System Backup",
                f"Full backup '{result['backup_name']}' created successfully",
                "success"
            )
        
        return BackupResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

@router.get("/backup/list", response_model=BackupListResponse)
async def list_backups(
    backup_type: Optional[str] = Query(None, description="Filter by backup type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """List available backups (Director only)"""
    try:
        backups = backup_service.list_backups(backup_type)
        
        return BackupListResponse(
            success=True,
            backups=backups,
            total_count=len(backups)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list backups: {str(e)}")

@router.post("/backup/restore/{backup_name}")
async def restore_backup(
    backup_name: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Restore database from backup (Director only)"""
    try:
        result = backup_service.restore_database_backup(backup_name)
        
        if result["success"]:
            background_tasks.add_task(
                notify_system,
                "Database Restore",
                f"Database restored from backup '{backup_name}'",
                "warning"
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")

@router.delete("/backup/cleanup")
async def cleanup_old_backups(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user),
    keep_days: int = Query(30, ge=1, le=365, description="Days to keep backups")
):
    """Clean up old backup files (Director only)"""
    try:
        result = backup_service.cleanup_old_backups(keep_days)
        
        if result["success"]:
            background_tasks.add_task(
                notify_system,
                "Backup Cleanup",
                f"Removed {result['removed_count']} old backup files",
                "info"
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

@router.get("/backup/stats")
async def get_backup_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Get backup system statistics (Director only)"""
    try:
        stats = backup_service.get_backup_statistics()
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

# Notification Endpoints
@router.post("/notification/send", response_model=NotificationResponse)
async def send_notification(
    notification: NotificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Send custom notification (Director only)"""
    try:
        result = await telegram_service.send_system_alert(
            notification.title,
            notification.message,
            notification.severity
        )
        
        return NotificationResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Notification failed: {str(e)}")

@router.get("/notification/test", response_model=TelegramTestResponse)
async def test_telegram_connection(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Test Telegram bot connection (Director only)"""
    try:
        result = await telegram_service.test_connection()
        
        if result["success"]:
            # Send test message
            await telegram_service.send_system_alert(
                "اختبار الاتصال",
                "تم اختبار اتصال البوت بنجاح!",
                "info"
            )
        
        return TelegramTestResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

@router.post("/notification/daily-summary")
async def send_daily_summary(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_director_user)
):
    """Send daily summary report (Director only)"""
    try:
        # Collect daily statistics
        from ..models.students import Student
        from ..models.finance import StudentPayment
        from ..models.schedules import ScheduleGenerationHistory
        
        today = datetime.now().date()
        
        # Get statistics
        new_students = db.query(Student).filter(
            Student.created_at >= today
        ).count()
        
        daily_payments = db.query(StudentPayment).filter(
            StudentPayment.payment_date >= today
        ).all()
        
        total_amount = sum(p.payment_amount for p in daily_payments)

        recent_schedules = db.query(ScheduleGenerationHistory).filter(
            ScheduleGenerationHistory.created_at >= today
        ).count()
        
        stats = {
            "students": {"new": new_students},
            "payments": {"total_amount": total_amount, "count": len(daily_payments)},
            "schedules": {"updated": recent_schedules},
            "system": {"status": "عادي"}
        }
        
        result = await telegram_service.send_daily_summary(stats)
        
        return {"success": True, "message": "Daily summary sent"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send summary: {str(e)}")

# System Status Endpoints
@router.get("/status", response_model=SystemStatsResponse)
async def get_system_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get system status and statistics"""
    try:
        from ..models.students import Student
        from ..models.teachers import Teacher
        from ..models.finance import StudentPayment
        from ..models.academic import Class
        
        # Collect system statistics
        total_students = db.query(Student).count()
        total_teachers = db.query(Teacher).count()
        total_classes = db.query(Class).count()
        
        # Backup statistics
        backup_stats = backup_service.get_backup_statistics()
        
        # Recent activity
        recent_students = db.query(Student).filter(
            Student.created_at >= datetime.now().date()
        ).count()
        
        recent_payments = db.query(StudentPayment).filter(
            StudentPayment.payment_date >= datetime.now().date()
        ).count()
        
        stats = SystemStatsResponse(
            success=True,
            system_health="healthy",
            total_students=total_students,
            total_teachers=total_teachers,
            total_classes=total_classes,
            recent_students=recent_students,
            recent_payments=recent_payments,
            backup_stats=backup_stats,
            last_updated=datetime.now()
        )
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system status: {str(e)}")

@router.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "backup": backup_service is not None,
            "telegram": telegram_service.enabled,
            "database": "connected"
        }
    }