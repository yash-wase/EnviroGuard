"""
Configuration file for EnviroGuard Backend Server
"""
import os

# Server Configuration
SERVER_VERSION = "1.0.0"
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8000

# Directory Configuration
DATA_DIR = "dataset"
MODEL_DIR = "emission_model"
UPLOAD_DIR = os.path.join(DATA_DIR, "uploads")

# File Configuration
ALLOWED_EXTENSIONS = {".csv"}
MAX_FILE_SIZE = 200 * 1024 * 1024  # 200MB

# Model Files
LAG_MODEL_PATH = os.path.join(MODEL_DIR, "multi_emission_model.pkl")
COLD_MODEL_PATH = os.path.join(MODEL_DIR, "multi_emission_cold_model.pkl")
FEATURE_COLUMNS_PATH = os.path.join(MODEL_DIR, "feature_columns.pkl")
TRAINING_STATS_PATH = os.path.join(MODEL_DIR, "training_stats.pkl")

# Data Files
REGISTRY_FILE = os.path.join(DATA_DIR, "industry_registry.csv")
TREND_FILE = os.path.join(DATA_DIR, "trend_history.csv")
MONITORING_FILE = os.path.join(DATA_DIR, "model_monitoring.csv")
SERVER_LOG_FILE = os.path.join(DATA_DIR, "server_logs.csv")

# Regulatory Limits
REGULATORY_LIMITS = {
    "CO2": 5000,
    "SO2": 80,
    "BOD": 250,
    "COD": 500
}

# Weights for Composite Index
COMPOSITE_WEIGHTS = {
    "CO2": 0.30,
    "SO2": 0.25,
    "BOD": 0.25,
    "COD": 0.20
}

# Thresholds
ALERT_THRESHOLDS = {
    "low": 0.4,
    "moderate": 0.7
}

REGULATORY_THRESHOLDS = {
    "sustainable": 0.3,
    "watchlist": 0.6,
    "risk": 0.8
}

QUALITY_THRESHOLDS = {
    "high": 80,
    "moderate": 60
}

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:5174",
]

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
