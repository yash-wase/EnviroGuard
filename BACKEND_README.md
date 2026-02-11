# 🔧 EnviroGuard Backend - Complete Documentation

**Version**: 1.0.0  
**Framework**: FastAPI  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [API Endpoints](#api-endpoints)
4. [Intelligence Modules](#intelligence-modules)
5. [Configuration](#configuration)
6. [Data Files](#data-files)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## Overview

The EnviroGuard backend is a production-ready FastAPI server that provides RESTful APIs for industrial emission prediction and analysis. It uses XGBoost models with 97.3% accuracy to forecast CO2, SO2, BOD, and COD emissions.

### Key Features
- ✅ 6 RESTful API endpoints
- ✅ Async request handling
- ✅ Model caching at startup
- ✅ CORS enabled
- ✅ File upload support
- ✅ Request logging
- ✅ Comprehensive error handling
- ✅ Interactive API documentation

---

## Installation

### Prerequisites
```bash
Python 3.8+
pip
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

**Dependencies**:
- fastapi - Web framework
- uvicorn - ASGI server
- pandas - Data processing
- numpy - Numerical computing
- xgboost - ML models
- scikit-learn - ML utilities
- shap - Model explainability
- matplotlib - Visualizations
- python-multipart - File uploads

### Start Server
```bash
# Development (with auto-reload)
uvicorn app:app --reload

# Production
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

**Server URLs**:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

---

## API Endpoints

### 1. Health Check
**GET** `/api/health`

Check server status and model loading state.

**Response**:
```json
{
  "status": "running",
  "version": "1.0.0",
  "timestamp": "2026-02-12T10:30:00",
  "models_loaded": true
}
```

**Example**:
```bash
curl http://localhost:8000/api/health
```

---

### 2. Predict
**POST** `/api/predict`

Upload CSV dataset and get emission predictions with full intelligence analysis.

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Body: `dataset` (file) - CSV file

**Response**:
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "industry_id": "IND001",
        "forecast": {
          "CO2": 4500.0,
          "SO2": 75.0,
          "BOD": 200.0,
          "COD": 450.0
        },
        "composite_index": 0.752,
        "alert_level": "Critical",
        "confidence": 87.5,
        "recommendation": {...}
      }
    ],
    "summary": {
      "Total_Industries": 150,
      "Critical_Count": 15,
      "Moderate_Count": 45,
      "Low_Count": 90
    }
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/api/predict \
  -F "dataset=@dataset/master_training_dataset.csv"
```

**Python**:
```python
import requests

url = "http://localhost:8000/api/predict"
files = {'dataset': open('dataset/master_training_dataset.csv', 'rb')}
response = requests.post(url, files=files)
result = response.json()
```

---

### 3. Simulate
**POST** `/api/simulate`

Run what-if scenario simulation.

**Request**:
```json
{
  "dataset_filename": "master_training_dataset.csv",
  "modifications": {
    "Production_Volume": 1.1,
    "Treatment_Efficiency": 85
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "comparisons": [
      {
        "Industry_ID": "IND001",
        "Baseline_Index": 0.752,
        "Scenario_Index": 0.680,
        "Delta_Index": -0.072
      }
    ]
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_filename": "master_training_dataset.csv",
    "modifications": {"Production_Volume": 1.1}
  }'
```

---

### 4. Ranking
**GET** `/api/ranking`

Get current industry rankings by emission risk.

**Response**:
```json
{
  "success": true,
  "data": {
    "ranking": [...],
    "registry_size": 150,
    "top_5_risky": ["IND001", "IND045", ...]
  }
}
```

**Example**:
```bash
curl http://localhost:8000/api/ranking
```

---

### 5. Trend
**GET** `/api/trend/{industry_id}`

Get historical composite index trend for a specific industry.

**Parameters**:
- `industry_id` (path) - Industry ID (e.g., "IND001")

**Response**:
```json
{
  "success": true,
  "data": {
    "industry_id": "IND001",
    "trend_data": [...],
    "trend_direction": "improving"
  }
}
```

**Example**:
```bash
curl http://localhost:8000/api/trend/IND001
```

---

### 6. Guidelines
**GET** `/api/guidelines`

Get regulatory limits, thresholds, and category mappings.

**Response**:
```json
{
  "success": true,
  "data": {
    "regulatory_limits": {
      "CO2": 5000,
      "SO2": 80,
      "BOD": 250,
      "COD": 500
    },
    "alert_levels": {...},
    "regulatory_categories": {...}
  }
}
```

**Example**:
```bash
curl http://localhost:8000/api/guidelines
```

---

## Intelligence Modules

### 1. predict.py
Main prediction pipeline with full intelligence report.

**Functions**:
```python
run_intelligent_prediction(dataset, num_samples=5, return_structured=True)
compute_confidence(ood_count, missing_ratio, model_type)
get_alert_level(composite_index)
log_model_monitoring(industry_id, predicted_*, actual_values)
```

**Usage**:
```python
from predict import run_intelligent_prediction

result = run_intelligent_prediction(
    "master_training_dataset.csv",
    num_samples=5,
    return_structured=True
)
```

---

### 2. forecast.py
Emission forecasting for next month.

**Functions**:
```python
forecast_emissions(dataset_filename)
```

**Returns**:
- Predictions for CO2, SO2, BOD, COD
- Model type used (lag-based or cold-start)
- OOD flags and missing ratio

---

### 3. ranking.py
Industry ranking and registry management.

**Functions**:
```python
compute_industry_ranking(dataset_filename)
update_industry_registry(industry_id, index, alert, confidence)
append_trend_history(industry_id, composite_index)
classify_regulatory_category(index)
```

---

### 4. simulation.py
What-if scenario analysis.

**Functions**:
```python
run_simulation(dataset_filename, modifications)
```

**Example**:
```python
from simulation import run_simulation

modifications = {
    "Production_Volume": 1.2,
    "Treatment_Efficiency": 85
}
comparisons = run_simulation("dataset.csv", modifications)
```

---

### 5. explain.py
SHAP-based root cause analysis.

**Functions**:
```python
explain_prediction(X_sample, pollutant, model_type)
get_recommendation(primary_driver)
```

---

### 6. mitigation.py
Countermeasure impact projection.

**Functions**:
```python
project_countermeasure_impact(dataset, industry_id, primary_driver)
```

**Returns**:
- Current index
- Projected index
- Improvement percentage
- Countermeasure description

---

### 7. visualization.py
Chart generation.

**Functions**:
```python
plot_severity_ranking(forecast_result, save=True)
plot_risk_vs_target(forecast_result, save=True)
plot_composite_index_trend(forecast_results, save=True)
plot_industry_ranking(ranking_df, save=True)
plot_mitigation_comparison(current, projected, industry_id, countermeasure)
plot_trend_analysis(industry_id, save=True)
```

---

### 8. validator.py
Data validation and quality classification.

**Functions**:
```python
validate_and_clean(df, training_stats)
align_features(df, feature_columns)
classify_dataset_quality(confidence_score)
```

---

## Configuration

### config.py

```python
# Server Configuration
SERVER_VERSION = "1.0.0"
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8000

# Directory Configuration
DATA_DIR = "dataset"
MODEL_DIR = "emission_model"
UPLOAD_DIR = "dataset/uploads"

# File Configuration
MAX_FILE_SIZE = 200 * 1024 * 1024  # 200MB
ALLOWED_EXTENSIONS = {".csv"}

# Regulatory Limits
REGULATORY_LIMITS = {
    "CO2": 5000,
    "SO2": 80,
    "BOD": 250,
    "COD": 500
}

# Composite Weights
COMPOSITE_WEIGHTS = {
    "CO2": 0.30,
    "SO2": 0.25,
    "BOD": 0.25,
    "COD": 0.20
}

# Alert Thresholds
ALERT_THRESHOLDS = {
    "low": 0.4,
    "moderate": 0.7
}

# CORS Origins
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

---

## Data Files

### Input Files
- `dataset/master_training_dataset.csv` - Main training dataset
- `dataset/uploads/` - Uploaded files directory

### Generated Files
- `dataset/industry_registry.csv` - Industry tracking
- `dataset/trend_history.csv` - Historical trends
- `dataset/model_monitoring.csv` - Drift monitoring
- `dataset/server_logs.csv` - API request logs
- `dataset/output_*.png` - Visualization charts

### Model Files
- `emission_model/multi_emission_model.pkl` - Lag-based model (97.6% accuracy)
- `emission_model/multi_emission_cold_model.pkl` - Cold-start model
- `emission_model/feature_columns.pkl` - Feature order
- `emission_model/training_stats.pkl` - Training statistics

---

## Testing

### Run Tests
```bash
# System verification
python verify_system.py

# Intelligence modules
python test_upgrades.py

# Prediction pipeline
python test_simple.py

# API endpoints (requires server running)
python test_api.py
```

### Test Coverage
- ✅ 48 system checks
- ✅ 10 module tests
- ✅ 3 pipeline tests
- ✅ 6 API endpoint tests

---

## Deployment

### Development
```bash
uvicorn app:app --reload
```

### Production with Gunicorn
```bash
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables
```bash
export DATA_DIR=/path/to/data
export MODEL_DIR=/path/to/models
export SERVER_PORT=8000
```

---

## Error Handling

### HTTP Status Codes
- **200**: Success
- **400**: Bad request (invalid file type, etc.)
- **404**: Resource not found
- **422**: Validation error (invalid CSV)
- **500**: Internal server error

### Error Response Format
```json
{
  "success": false,
  "data": null,
  "error": "Error message here",
  "timestamp": "2026-02-12T10:30:00"
}
```

---

## Performance

| Metric | Value |
|--------|-------|
| Startup Time | ~2-3 seconds |
| Prediction Time | ~30-60 seconds |
| Concurrent Requests | 20+ |
| Memory Usage | ~500MB |
| Model Accuracy | 97.3% |

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process or use different port
uvicorn app:app --port 8001
```

### Models Not Loading
```bash
# Retrain models
python train.py master_training_dataset.csv
```

### CORS Errors
Add your frontend URL to `CORS_ORIGINS` in `config.py`

---

## API Documentation

Interactive documentation available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: February 12, 2026

© 2024 EnviroGuard Backend
