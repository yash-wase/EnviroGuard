"""
File handling utilities for EnviroGuard Backend
"""
import os
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException
from config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE, UPLOAD_DIR, DATA_DIR

def validate_file_extension(filename: str) -> bool:
    """Validate file extension"""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS

def validate_file_size(file: UploadFile) -> bool:
    """Validate file size"""
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    return file_size <= MAX_FILE_SIZE

async def save_upload_file(upload_file: UploadFile) -> str:
    """
    Save uploaded file to dataset/uploads/ directory
    
    Returns:
        str: Saved filename
    """
    # Validate extension
    if not validate_file_extension(upload_file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Only CSV files are allowed."
        )
    
    # Validate size
    if not validate_file_size(upload_file):
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024):.0f}MB"
        )
    
    # Generate safe filename
    filename = Path(upload_file.filename).name
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )
    
    return filename

def get_dataset_path(filename: str) -> str:
    """
    Get full path to dataset file
    
    Args:
        filename: Name of the file
        
    Returns:
        str: Full path to file
    """
    # Check in uploads directory first
    upload_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(upload_path):
        return upload_path
    
    # Check in main dataset directory
    dataset_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(dataset_path):
        return dataset_path
    
    raise HTTPException(
        status_code=404,
        detail=f"Dataset file '{filename}' not found"
    )

def validate_csv_file(filepath: str) -> bool:
    """
    Validate CSV file can be read
    
    Args:
        filepath: Path to CSV file
        
    Returns:
        bool: True if valid
    """
    try:
        import pandas as pd
        # Try reading with different encodings and separators
        try:
            df = pd.read_csv(filepath, nrows=5)
        except:
            # Try with different separator
            try:
                df = pd.read_csv(filepath, sep=';', nrows=5)
            except:
                # Try with different encoding
                try:
                    df = pd.read_csv(filepath, encoding='latin-1', nrows=5)
                except:
                    df = pd.read_csv(filepath, sep=';', encoding='latin-1', nrows=5)
        
        if len(df) == 0:
            raise ValueError("CSV file is empty")
        
        return True
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid CSV file: {str(e)}"
        )

def cleanup_old_uploads(max_age_hours: int = 24):
    """
    Clean up old uploaded files
    
    Args:
        max_age_hours: Maximum age of files to keep
    """
    import time
    current_time = time.time()
    
    for filename in os.listdir(UPLOAD_DIR):
        filepath = os.path.join(UPLOAD_DIR, filename)
        if os.path.isfile(filepath):
            file_age = current_time - os.path.getmtime(filepath)
            if file_age > (max_age_hours * 3600):
                try:
                    os.remove(filepath)
                except Exception:
                    pass
