from fastapi import HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import traceback
import logging
from typing import Union

from ..services.security_service import security_service

logger = logging.getLogger(__name__)

class AuthenticationError(HTTPException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class AuthorizationError(HTTPException):
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class ValidationError(HTTPException):
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)

class NotFoundError(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class DatabaseError(HTTPException):
    def __init__(self, detail: str = "Database operation failed"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

class FileUploadError(HTTPException):
    def __init__(self, detail: str = "File upload failed"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class SecurityError(HTTPException):
    def __init__(self, detail: str = "Security violation detected"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class RateLimitError(HTTPException):
    def __init__(self, detail: str = "Rate limit exceeded"):
        super().__init__(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)

class BusinessLogicError(HTTPException):
    def __init__(self, detail: str = "Business logic violation"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)

# Global Exception Handlers

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for unhandled exceptions"""
    error_id = id(exc)
    
    # Log the error
    logger.error(f"Unhandled exception [{error_id}]: {str(exc)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    # Log to audit system
    client_ip = request.client.host if request.client else "unknown"
    security_service.log_audit_event(
        user_id=None,
        action="UNHANDLED_EXCEPTION",
        table_name="system_errors",
        ip_address=client_ip,
        new_values={
            "error_id": error_id,
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "path": str(request.url),
            "method": request.method
        }
    )
    
    # Create system notification for critical errors
    security_service.create_system_notification(
        recipient_role="director",
        recipient_id=None,
        title="System Error Alert",
        message=f"Unhandled exception occurred: {type(exc).__name__} - {str(exc)[:100]}",
        notification_type="error"
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred",
            "error_id": error_id,
            "type": "internal_server_error"
        }
    )

async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handler for HTTP exceptions"""
    client_ip = request.client.host if request.client else "unknown"
    
    # Log HTTP errors (except 404s to avoid spam)
    if exc.status_code != 404:
        security_service.log_audit_event(
            user_id=None,
            action="HTTP_EXCEPTION",
            table_name="http_errors",
            ip_address=client_ip,
            new_values={
                "status_code": exc.status_code,
                "detail": exc.detail,
                "path": str(request.url),
                "method": request.method
            }
        )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "type": "http_exception",
            "status_code": exc.status_code
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handler for request validation errors"""
    client_ip = request.client.host if request.client else "unknown"
    
    # Log validation errors
    security_service.log_audit_event(
        user_id=None,
        action="VALIDATION_ERROR",
        table_name="validation_errors",
        ip_address=client_ip,
        new_values={
            "errors": exc.errors(),
            "path": str(request.url),
            "method": request.method
        }
    )
    
    # Ensure errors are JSON-serializable (avoid bytes)
    def ensure_jsonable(value):
        if isinstance(value, (bytes, bytearray)):
            return value.decode("utf-8", errors="ignore")
        if isinstance(value, dict):
            return {k: ensure_jsonable(v) for k, v in value.items()}
        if isinstance(value, list):
            return [ensure_jsonable(v) for v in value]
        return value

    serialized_errors = [ensure_jsonable(err) for err in exc.errors()]

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": serialized_errors,
            "type": "validation_error"
        }
    )

async def database_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handler for database exceptions"""
    client_ip = request.client.host if request.client else "unknown"
    
    # Log database errors
    logger.error(f"Database error: {str(exc)}")
    security_service.log_audit_event(
        user_id=None,
        action="DATABASE_ERROR",
        table_name="database_errors",
        ip_address=client_ip,
        new_values={
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "path": str(request.url),
            "method": request.method
        }
    )
    
    # Create system notification for database errors
    security_service.create_system_notification(
        recipient_role="director",
        recipient_id=None,
        title="Database Error Alert",
        message=f"Database error occurred: {type(exc).__name__}",
        notification_type="error"
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Database operation failed",
            "type": "database_error"
        }
    )