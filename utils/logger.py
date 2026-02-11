"""
Logging utilities for EnviroGuard Backend
"""
import os
import pandas as pd
from datetime import datetime
from config import SERVER_LOG_FILE

def log_request(
    endpoint: str,
    industry_id: str = None,
    alert_level: str = None,
    confidence: float = None,
    response_time: float = None,
    status: str = "success",
    error: str = None
):
    """
    Log API request to server_logs.csv
    
    Args:
        endpoint: API endpoint called
        industry_id: Industry ID (if applicable)
        alert_level: Alert level (if applicable)
        confidence: Confidence score (if applicable)
        response_time: Response time in seconds
        status: Request status (success/error)
        error: Error message (if any)
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Create log entry
    log_entry = {
        "Timestamp": timestamp,
        "Endpoint": endpoint,
        "Industry_ID": industry_id or "N/A",
        "Alert_Level": alert_level or "N/A",
        "Confidence": confidence if confidence is not None else "N/A",
        "Response_Time": f"{response_time:.3f}s" if response_time else "N/A",
        "Status": status,
        "Error": error or "None"
    }
    
    # Load or create log file
    if os.path.exists(SERVER_LOG_FILE):
        try:
            logs = pd.read_csv(SERVER_LOG_FILE)
        except Exception:
            logs = pd.DataFrame(columns=log_entry.keys())
    else:
        logs = pd.DataFrame(columns=log_entry.keys())
    
    # Append new entry
    new_entry = pd.DataFrame([log_entry])
    logs = pd.concat([logs, new_entry], ignore_index=True)
    
    # Save log file
    try:
        logs.to_csv(SERVER_LOG_FILE, index=False)
    except Exception as e:
        print(f"Warning: Failed to write log: {e}")
