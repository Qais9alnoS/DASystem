"""
Advanced File Management Service
Handles file uploads with validation, compression, and security checks
"""

import os
import hashlib
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False
    print("Warning: python-magic not available. File type validation will be limited.")
import uuid
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image, ImageOps
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models.system import FileUpload
from ..config import settings

class FileService:
    """Advanced file management service"""
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIRECTORY)
        self.upload_dir.mkdir(exist_ok=True)
        
        # Create subdirectories
        self.image_dir = self.upload_dir / "images"
        self.document_dir = self.upload_dir / "documents"
        self.temp_dir = self.upload_dir / "temp"
        
        for directory in [self.image_dir, self.document_dir, self.temp_dir]:
            directory.mkdir(exist_ok=True)
        
        # Allowed file types
        self.allowed_image_types = {
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'
        }
        self.allowed_document_types = {
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'text/csv'
        }
        
        # Maximum file sizes (in bytes)
        self.max_image_size = 5 * 1024 * 1024  # 5MB
        self.max_document_size = 10 * 1024 * 1024  # 10MB
        
        # Image compression settings
        self.image_quality = 85
        self.max_image_dimension = 1920
    
    def validate_file(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """Validate uploaded file"""
        try:
            if not os.path.exists(file_path):
                return {"valid": False, "error": "File does not exist"}
            
            file_size = os.path.getsize(file_path)
            
            # Check file size limits
            if file_type in self.allowed_image_types:
                if file_size > self.max_image_size:
                    return {"valid": False, "error": f"Image file too large. Maximum size: {self.max_image_size // (1024*1024)}MB"}
            elif file_type in self.allowed_document_types:
                if file_size > self.max_document_size:
                    return {"valid": False, "error": f"Document file too large. Maximum size: {self.max_document_size // (1024*1024)}MB"}
            else:
                return {"valid": False, "error": f"File type not allowed: {file_type}"}
            
            # Check if file type matches content (if python-magic is available)
            if MAGIC_AVAILABLE:
                try:
                    detected_type = magic.from_file(file_path, mime=True)
                    if detected_type != file_type:
                        return {"valid": False, "error": f"File type mismatch. Expected: {file_type}, Detected: {detected_type}"}
                except Exception as e:
                    # If magic detection fails, continue with basic validation
                    print(f"Warning: Magic file detection failed: {e}")
                    pass
            else:
                # Basic file extension validation when python-magic is not available
                file_ext = Path(file_path).suffix.lower()
                expected_extensions = {
                    'image/jpeg': ['.jpg', '.jpeg'],
                    'image/png': ['.png'],
                    'image/gif': ['.gif'],
                    'image/bmp': ['.bmp'],
                    'image/webp': ['.webp'],
                    'application/pdf': ['.pdf'],
                    'text/plain': ['.txt'],
                    'text/csv': ['.csv']
                }
                
                if file_type in expected_extensions:
                    if file_ext not in expected_extensions[file_type]:
                        return {"valid": False, "error": f"File extension {file_ext} doesn't match expected type {file_type}"}
            
            # Additional security checks for images
            if file_type in self.allowed_image_types:
                try:
                    with Image.open(file_path) as img:
                        # Verify it's a valid image
                        img.verify()
                except Exception as e:
                    return {"valid": False, "error": f"Invalid image file: {str(e)}"}
            
            return {"valid": True, "file_size": file_size}
            
        except Exception as e:
            return {"valid": False, "error": f"File validation error: {str(e)}"}
    
    def calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA-256 hash of file"""
        hash_sha256 = hashlib.sha256()
        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_sha256.update(chunk)
            return hash_sha256.hexdigest()
        except Exception:
            return ""
    
    def compress_image(self, input_path: str, output_path: str) -> Dict[str, Any]:
        """Compress and optimize image"""
        try:
            with Image.open(input_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                
                # Auto-orient based on EXIF data
                img = ImageOps.exif_transpose(img)
                
                # Resize if too large
                if max(img.size) > self.max_image_dimension:
                    img.thumbnail((self.max_image_dimension, self.max_image_dimension), Image.Resampling.LANCZOS)
                
                # Save with optimization
                img.save(output_path, 'JPEG', quality=self.image_quality, optimize=True)
                
                original_size = os.path.getsize(input_path)
                compressed_size = os.path.getsize(output_path)
                
                return {
                    "success": True,
                    "original_size": original_size,
                    "compressed_size": compressed_size,
                    "compression_ratio": (original_size - compressed_size) / original_size * 100
                }
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def upload_file(self, file_content: bytes, original_filename: str, file_type: str,
                   uploaded_by: int, related_entity_type: Optional[str] = None,
                   related_entity_id: Optional[int] = None) -> Dict[str, Any]:
        """Upload and process file"""
        try:
            # Generate unique filename
            file_extension = Path(original_filename).suffix.lower()
            unique_filename = f"{uuid.uuid4().hex}{file_extension}"
            
            # Determine storage directory
            if file_type in self.allowed_image_types:
                storage_dir = self.image_dir
            else:
                storage_dir = self.document_dir
            
            temp_file_path = self.temp_dir / unique_filename
            final_file_path = storage_dir / unique_filename
            
            # Write file to temp location
            with open(temp_file_path, 'wb') as f:
                f.write(file_content)
            
            # Validate file
            validation = self.validate_file(str(temp_file_path), file_type)
            if not validation["valid"]:
                os.remove(temp_file_path)
                return {"success": False, "error": validation["error"]}
            
            # Calculate file hash
            file_hash = self.calculate_file_hash(str(temp_file_path))
            
            # Check for duplicate files
            db = SessionLocal()
            try:
                existing_file = db.query(FileUpload).filter(
                    FileUpload.file_hash == file_hash
                ).first()
                
                if existing_file:
                    os.remove(temp_file_path)
                    return {
                        "success": False,
                        "error": "File already exists",
                        "existing_file_id": existing_file.id
                    }
                
                # Process file based on type
                if file_type in self.allowed_image_types:
                    # Compress image
                    compression_result = self.compress_image(str(temp_file_path), str(final_file_path))
                    if not compression_result["success"]:
                        os.remove(temp_file_path)
                        return {"success": False, "error": f"Image compression failed: {compression_result['error']}"}
                else:
                    # Move document file
                    os.rename(temp_file_path, final_file_path)
                
                # Create database record
                file_record = FileUpload(
                    filename=unique_filename,
                    original_filename=original_filename,
                    file_path=str(final_file_path),
                    file_size=os.path.getsize(final_file_path),
                    file_type=file_type,
                    file_hash=file_hash,
                    uploaded_by=uploaded_by,
                    related_entity_type=related_entity_type,
                    related_entity_id=related_entity_id,
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                
                db.add(file_record)
                db.commit()
                db.refresh(file_record)
                
                return {
                    "success": True,
                    "file_id": file_record.id,
                    "filename": unique_filename,
                    "file_size": file_record.file_size,
                    "file_url": f"/api/files/{file_record.id}/download"
                }
                
            finally:
                db.close()
                
        except Exception as e:
            # Cleanup temp file if it exists
            if temp_file_path.exists():
                os.remove(temp_file_path)
            return {"success": False, "error": f"Upload failed: {str(e)}"}
    
    def get_file(self, file_id: int, user_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Get file information"""
        try:
            db = SessionLocal()
            try:
                query = db.query(FileUpload).filter(
                    FileUpload.id == file_id,
                    FileUpload.is_active == True
                )
                
                # Optional user access control
                if user_id:
                    query = query.filter(FileUpload.uploaded_by == user_id)
                
                file_record = query.first()
                
                if not file_record:
                    return None
                
                return {
                    "id": file_record.id,
                    "filename": file_record.filename,
                    "original_filename": file_record.original_filename,
                    "file_path": file_record.file_path,
                    "file_size": file_record.file_size,
                    "file_type": file_record.file_type,
                    "uploaded_by": file_record.uploaded_by,
                    "related_entity_type": file_record.related_entity_type,
                    "related_entity_id": file_record.related_entity_id,
                    "created_at": file_record.created_at
                }
                
            finally:
                db.close()
                
        except Exception as e:
            print(f"Failed to get file: {e}")
            return None
    
    def delete_file(self, file_id: int, user_id: Optional[int] = None) -> bool:
        """Delete file"""
        try:
            db = SessionLocal()
            try:
                query = db.query(FileUpload).filter(
                    FileUpload.id == file_id,
                    FileUpload.is_active == True
                )
                
                # Optional user access control
                if user_id:
                    query = query.filter(FileUpload.uploaded_by == user_id)
                
                file_record = query.first()
                
                if not file_record:
                    return False
                
                # Delete physical file
                if os.path.exists(file_record.file_path):
                    os.remove(file_record.file_path)
                
                # Mark as inactive in database
                file_record.is_active = False
                db.commit()
                
                return True
                
            finally:
                db.close()
                
        except Exception as e:
            print(f"Failed to delete file: {e}")
            return False
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage usage statistics"""
        try:
            db = SessionLocal()
            try:
                # Total files
                total_files = db.query(FileUpload).filter(
                    FileUpload.is_active == True
                ).count()
                
                # Total size
                total_size = db.query(FileUpload).filter(
                    FileUpload.is_active == True
                ).with_entities(db.func.sum(FileUpload.file_size)).scalar() or 0
                
                # Files by type
                image_files = db.query(FileUpload).filter(
                    FileUpload.is_active == True,
                    FileUpload.file_type.in_(self.allowed_image_types)
                ).count()
                
                document_files = total_files - image_files
                
                # Available space (approximate)
                disk_usage = os.statvfs(self.upload_dir)
                available_space = disk_usage.f_frsize * disk_usage.f_bavail
                
                return {
                    "total_files": total_files,
                    "image_files": image_files,
                    "document_files": document_files,
                    "total_size_bytes": total_size,
                    "total_size_mb": round(total_size / (1024 * 1024), 2),
                    "available_space_bytes": available_space,
                    "available_space_gb": round(available_space / (1024 * 1024 * 1024), 2)
                }
                
            finally:
                db.close()
                
        except Exception as e:
            print(f"Failed to get storage stats: {e}")
            return {}
    
    def cleanup_old_temp_files(self, hours_old: int = 24) -> int:
        """Clean up old temporary files"""
        try:
            cutoff_time = datetime.now().timestamp() - (hours_old * 3600)
            cleaned_count = 0
            
            for file_path in self.temp_dir.iterdir():
                if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                    try:
                        os.remove(file_path)
                        cleaned_count += 1
                    except:
                        pass
            
            return cleaned_count
            
        except Exception as e:
            print(f"Failed to cleanup temp files: {e}")
            return 0

# Global file service instance
file_service = FileService()