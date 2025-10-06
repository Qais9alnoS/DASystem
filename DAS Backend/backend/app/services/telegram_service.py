import asyncio
import aiohttp
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

from ..config import settings

logger = logging.getLogger(__name__)

class MessageType(Enum):
    """Types of notification messages"""
    INFO = "ℹ️"
    SUCCESS = "✅"
    WARNING = "⚠️"
    ERROR = "❌"
    BACKUP = "💾"
    SECURITY = "🔒"
    FINANCE = "💰"
    SCHEDULE = "📅"
    STUDENT = "👨‍🎓"
    TEACHER = "👨‍🏫"
    SYSTEM = "🖥️"

class TelegramNotificationService:
    """Telegram notification service for school management system"""
    
    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.chat_id = settings.TELEGRAM_CHAT_ID
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
        self.enabled = bool(self.bot_token and self.chat_id)
        
        if not self.enabled:
            logger.warning("Telegram notifications disabled: missing bot token or chat ID")
    
    async def send_message(self, message: str, message_type: MessageType = MessageType.INFO,
                          parse_mode: str = "HTML", disable_notification: bool = False) -> Dict[str, Any]:
        """Send a message to Telegram"""
        if not self.enabled:
            logger.warning("Telegram not configured, skipping notification")
            return {"success": False, "error": "Telegram not configured"}
        
        try:
            # Format message with emoji and timestamp
            formatted_message = self._format_message(message, message_type)
            
            payload = {
                "chat_id": self.chat_id,
                "text": formatted_message,
                "parse_mode": parse_mode,
                "disable_notification": disable_notification
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.base_url}/sendMessage", json=payload) as response:
                    result = await response.json()
                    
                    if response.status == 200 and result.get("ok"):
                        logger.info("Telegram message sent successfully")
                        return {"success": True, "message_id": result.get("result", {}).get("message_id")}
                    else:
                        logger.error(f"Telegram API error: {result}")
                        return {"success": False, "error": result.get("description", "Unknown error")}
        
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return {"success": False, "error": str(e)}
    
    async def send_authentication_alert(self, username: str, role: str, ip_address: str = None, 
                                      success: bool = True) -> Dict[str, Any]:
        """Send authentication notification"""
        if success:
            message = f"<b>✅ تسجيل دخول ناجح</b>\n\n"
            message += f"👤 المستخدم: <code>{username}</code>\n"
            message += f"🎭 الدور: <code>{role}</code>\n"
            if ip_address:
                message += f"🌐 عنوان IP: <code>{ip_address}</code>\n"
            message += f"🕐 الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            return await self.send_message(message, MessageType.SECURITY, disable_notification=True)
        else:
            message = f"<b>❌ محاولة تسجيل دخول فاشلة</b>\n\n"
            message += f"👤 المستخدم: <code>{username}</code>\n"
            if ip_address:
                message += f"🌐 عنوان IP: <code>{ip_address}</code>\n"
            message += f"🕐 الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            return await self.send_message(message, MessageType.ERROR)
    
    async def send_password_reset_notification(self, username: str, role: str, 
                                             new_password: str) -> Dict[str, Any]:
        """Send password reset notification"""
        message = f"<b>🔑 إعادة تعيين كلمة المرور</b>\n\n"
        message += f"👤 المستخدم: <code>{username}</code>\n"
        message += f"🎭 الدور: <code>{role}</code>\n"
        message += f"🔐 كلمة المرور الجديدة: <code>{new_password}</code>\n\n"
        message += f"⚠️ يرجى تغيير كلمة المرور عند تسجيل الدخول التالي\n"
        message += f"🕐 الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        return await self.send_message(message, MessageType.SECURITY)
    
    async def send_backup_notification(self, backup_type: str, backup_name: str, 
                                     success: bool = True, error_msg: str = None) -> Dict[str, Any]:
        """Send backup notification"""
        if success:
            message = f"<b>💾 نسخة احتياطية ناجحة</b>\n\n"
            message += f"📋 النوع: <code>{backup_type}</code>\n"
            message += f"📁 اسم النسخة: <code>{backup_name}</code>\n"
            message += f"🕐 الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            return await self.send_message(message, MessageType.BACKUP, disable_notification=True)
        else:
            message = f"<b>❌ فشل في إنشاء النسخة الاحتياطية</b>\n\n"
            message += f"📋 النوع: <code>{backup_type}</code>\n"
            if error_msg:
                message += f"❌ الخطأ: <code>{error_msg}</code>\n"
            message += f"🕐 الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            return await self.send_message(message, MessageType.ERROR)
    
    async def send_payment_notification(self, student_name: str, amount: float, 
                                      payment_type: str, success: bool = True) -> Dict[str, Any]:
        """Send payment notification"""
        if success:
            message = f"<b>💰 دفعة جديدة</b>\n\n"
            message += f"👨‍🎓 الطالب: <code>{student_name}</code>\n"
            message += f"💵 المبلغ: <code>{amount:,.2f}</code> ج.م\n"
            message += f"📋 نوع الدفع: <code>{payment_type}</code>\n"
            message += f"🕐 الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            return await self.send_message(message, MessageType.FINANCE, disable_notification=True)
        else:
            message = f"<b>❌ فشل في معالجة الدفعة</b>\n\n"
            message += f"👨‍🎓 الطالب: <code>{student_name}</code>\n"
            message += f"💵 المبلغ: <code>{amount:,.2f}</code> ج.م\n"
            message += f"🕐 الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            return await self.send_message(message, MessageType.ERROR)
    
    async def send_schedule_notification(self, message_text: str, 
                                       notification_type: str = "info") -> Dict[str, Any]:
        """Send schedule-related notification"""
        message_types = {
            "info": MessageType.SCHEDULE,
            "success": MessageType.SUCCESS,
            "warning": MessageType.WARNING,
            "error": MessageType.ERROR
        }
        
        formatted_message = f"<b>📅 إشعار الجدولة</b>\n\n{message_text}"
        formatted_message += f"\n🕐 الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        return await self.send_message(
            formatted_message, 
            message_types.get(notification_type, MessageType.INFO)
        )
    
    async def send_student_registration_notification(self, student_name: str, 
                                                   class_name: str, student_id: str) -> Dict[str, Any]:
        """Send new student registration notification"""
        message = f"<b>👨‍🎓 طالب جديد</b>\n\n"
        message += f"📝 الاسم: <code>{student_name}</code>\n"
        message += f"🏫 الفصل: <code>{class_name}</code>\n"
        message += f"🆔 رقم الطالب: <code>{student_id}</code>\n"
        message += f"🕐 وقت التسجيل: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        return await self.send_message(message, MessageType.STUDENT)
    
    async def send_teacher_notification(self, teacher_name: str, subject: str, 
                                      action: str = "added") -> Dict[str, Any]:
        """Send teacher-related notification"""
        actions_ar = {
            "added": "إضافة مدرس جديد",
            "updated": "تحديث بيانات مدرس",
            "removed": "إزالة مدرس"
        }
        
        message = f"<b>👨‍🏫 {actions_ar.get(action, action)}</b>\n\n"
        message += f"📝 الاسم: <code>{teacher_name}</code>\n"
        message += f"📚 المادة: <code>{subject}</code>\n"
        message += f"🕐 الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        return await self.send_message(message, MessageType.TEACHER)
    
    async def send_system_alert(self, alert_title: str, alert_message: str, 
                              severity: str = "info") -> Dict[str, Any]:
        """Send system alert notification"""
        severity_icons = {
            "info": "ℹ️",
            "warning": "⚠️",
            "error": "❌",
            "critical": "🚨"
        }
        
        message = f"<b>{severity_icons.get(severity, 'ℹ️')} {alert_title}</b>\n\n"
        message += f"{alert_message}\n\n"
        message += f"🕐 الوقت: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        message_type = MessageType.ERROR if severity in ["error", "critical"] else MessageType.WARNING if severity == "warning" else MessageType.SYSTEM
        
        return await self.send_message(message, message_type)
    
    async def send_daily_summary(self, stats: Dict[str, Any]) -> Dict[str, Any]:
        """Send daily summary report"""
        message = f"<b>📊 التقرير اليومي</b>\n\n"
        
        if "students" in stats:
            message += f"👨‍🎓 الطلاب الجدد: {stats['students'].get('new', 0)}\n"
        
        if "payments" in stats:
            message += f"💰 إجمالي الدفعات: {stats['payments'].get('total_amount', 0):,.2f} ج.م\n"
            message += f"💳 عدد الدفعات: {stats['payments'].get('count', 0)}\n"
        
        if "schedules" in stats:
            message += f"📅 الجداول المُحدثة: {stats['schedules'].get('updated', 0)}\n"
        
        if "system" in stats:
            message += f"🖥️ حالة النظام: {stats['system'].get('status', 'عادي')}\n"
        
        message += f"\n📅 التاريخ: {datetime.now().strftime('%Y-%m-%d')}"
        
        return await self.send_message(message, MessageType.INFO, disable_notification=True)
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test Telegram bot connection"""
        if not self.enabled:
            return {"success": False, "error": "Telegram not configured"}
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/getMe") as response:
                    result = await response.json()
                    
                    if response.status == 200 and result.get("ok"):
                        bot_info = result.get("result", {})
                        return {
                            "success": True,
                            "bot_info": {
                                "username": bot_info.get("username"),
                                "first_name": bot_info.get("first_name"),
                                "can_join_groups": bot_info.get("can_join_groups"),
                                "can_read_all_group_messages": bot_info.get("can_read_all_group_messages")
                            }
                        }
                    else:
                        return {"success": False, "error": result.get("description", "Unknown error")}
        
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _format_message(self, message: str, message_type: MessageType) -> str:
        """Format message with emoji and timestamp"""
        if not message.startswith("<b>"):
            # Add emoji prefix if not already formatted
            formatted = f"{message_type.value} {message}"
        else:
            formatted = message
        
        return formatted

# Global notification service instance
telegram_service = TelegramNotificationService()

# Convenience functions for common notifications
async def notify_login(username: str, role: str, ip_address: str = None, success: bool = True):
    """Quick login notification"""
    return await telegram_service.send_authentication_alert(username, role, ip_address, success)

async def notify_password_reset(username: str, role: str, new_password: str):
    """Quick password reset notification"""
    return await telegram_service.send_password_reset_notification(username, role, new_password)

async def notify_backup(backup_type: str, backup_name: str, success: bool = True, error_msg: str = None):
    """Quick backup notification"""
    return await telegram_service.send_backup_notification(backup_type, backup_name, success, error_msg)

async def notify_payment(student_name: str, amount: float, payment_type: str, success: bool = True):
    """Quick payment notification"""
    return await telegram_service.send_payment_notification(student_name, amount, payment_type, success)

async def notify_system(title: str, message: str, severity: str = "info"):
    """Quick system notification"""
    return await telegram_service.send_system_alert(title, message, severity)