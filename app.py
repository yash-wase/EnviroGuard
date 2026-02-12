"""
EnviroGuard Backend API Server
Production-ready FastAPI server for industrial emission intelligence
"""
import os
import time
import joblib
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd

# Import configuration
from config import (
    SERVER_VERSION, CORS_ORIGINS, LAG_MODEL_PATH, COLD_MODEL_PATH,
    FEATURE_COLUMNS_PATH, TRAINING_STATS_PATH, DATA_DIR, REGISTRY_FILE,
    TREND_FILE, REGULATORY_LIMITS, COMPOSITE_WEIGHTS, ALERT_THRESHOLDS,
    REGULATORY_THRESHOLDS, QUALITY_THRESHOLDS
)

# Import schemas
from schemas import (
    HealthResponse, SimulationRequest, APIResponse,
    PredictionResponse, SimulationResponse, RankingResponse,
    TrendResponse, GuidelinesResponse
)

# Import utilities
from utils.file_handler import save_upload_file, get_dataset_path, validate_csv_file, cleanup_old_uploads
from utils.response_formatter import (
    format_success_response, format_error_response,
    convert_prediction_to_schema, convert_simulation_to_schema,
    convert_ranking_to_schema, convert_trend_to_schema
)
from utils.logger import log_request

# Import intelligence modules
from predict import run_intelligent_prediction
from simulation import run_simulation
from ranking import compute_industry_ranking, get_risk_summary

# ============================================================================
# GLOBAL MODEL STORAGE
# ============================================================================

class ModelStore:
    """Global model storage to avoid reloading"""
    lag_model = None
    cold_model = None
    feature_columns = None
    training_stats = None
    models_loaded = False

model_store = ModelStore()

# ============================================================================
# STARTUP/SHUTDOWN EVENTS
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup: Load models into memory
    print("=" * 60)
    print("EnviroGuard Backend Server Starting...")
    print("=" * 60)
    
    try:
        # Load models
        print("Loading models into memory...")
        
        if os.path.exists(LAG_MODEL_PATH):
            model_store.lag_model = joblib.load(LAG_MODEL_PATH)
            print("✓ Lag-based model loaded")
        else:
            print("⚠ Lag-based model not found")
        
        if os.path.exists(COLD_MODEL_PATH):
            model_store.cold_model = joblib.load(COLD_MODEL_PATH)
            print("✓ Cold-start model loaded")
        else:
            print("⚠ Cold-start model not found")
        
        if os.path.exists(FEATURE_COLUMNS_PATH):
            model_store.feature_columns = joblib.load(FEATURE_COLUMNS_PATH)
            print("✓ Feature columns loaded")
        else:
            print("⚠ Feature columns not found")
        
        if os.path.exists(TRAINING_STATS_PATH):
            model_store.training_stats = joblib.load(TRAINING_STATS_PATH)
            print("✓ Training stats loaded")
        else:
            print("⚠ Training stats not found")
        
        model_store.models_loaded = True
        print("✓ All models loaded successfully")
        
    except Exception as e:
        print(f"✗ Error loading models: {e}")
        model_store.models_loaded = False
    
    print("=" * 60)
    print(f"Server ready at http://0.0.0.0:4001")
    print(f"API docs at http://0.0.0.0:4001/docs")
    print("=" * 60)
    
    yield
    
    # Shutdown
    print("\nShutting down EnviroGuard Backend Server...")
    print("Cleaning up resources...")
    cleanup_old_uploads(max_age_hours=24)
    print("✓ Shutdown complete")

# ============================================================================
# FASTAPI APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="EnviroGuard Backend API",
    description="Production-ready API for industrial emission intelligence",
    version=SERVER_VERSION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/api/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """
    Health check endpoint
    
    Returns server status and version
    """
    start_time = time.time()
    
    response = {
        "status": "running",
        "version": SERVER_VERSION,
        "timestamp": datetime.now().isoformat(),
        "models_loaded": model_store.models_loaded
    }
    
    response_time = time.time() - start_time
    log_request("/api/health", response_time=response_time)
    
    return response

@app.post("/api/predict", tags=["Prediction"])
async def predict(
    background_tasks: BackgroundTasks,
    dataset: UploadFile = File(..., description="CSV dataset file")
):
    """
    Main prediction endpoint
    
    Upload a CSV dataset and get emission predictions with full intelligence analysis
    """
    start_time = time.time()
    
    try:
        print(f"\n{'='*60}")
        print(f"UPLOAD REQUEST RECEIVED")
        print(f"Filename: {dataset.filename}")
        print(f"Content Type: {dataset.content_type}")
        print(f"{'='*60}\n")
        
        # Save uploaded file
        filename = await save_upload_file(dataset)
        print(f"✓ File saved as: {filename}")
        
        file_path = get_dataset_path(filename)
        print(f"✓ File path: {file_path}")
        
        # Validate CSV
        validate_csv_file(file_path)
        print(f"✓ CSV validated")
        
        # Run prediction - just pass the filename, modules will find it in uploads
        print(f"Starting prediction with 5 samples...")
        result = run_intelligent_prediction(
            filename,
            num_samples=5,
            return_structured=True
        )
        print(f"✓ Prediction complete")
        
        # Format response
        formatted_data = convert_prediction_to_schema(result)
        print(f"✓ Response formatted")
        
        # Log request
        response_time = time.time() - start_time
        print(f"✓ Total time: {response_time:.2f}s")
        
        if result["predictions"]:
            first_pred = result["predictions"][0]
            log_request(
                "/api/predict",
                industry_id=first_pred.get("industry_id"),
                alert_level=first_pred.get("alert_level"),
                confidence=first_pred.get("confidence"),
                response_time=response_time
            )
        
        # Schedule cleanup in background
        background_tasks.add_task(cleanup_old_uploads, 24)
        
        return format_success_response(formatted_data)
    
    except HTTPException as he:
        response_time = time.time() - start_time
        log_request("/api/predict", response_time=response_time, status="error", error=he.detail)
        raise he
    
    except Exception as e:
        response_time = time.time() - start_time
        error_msg = f"Prediction failed: {str(e)}"
        print(f"ERROR in /api/predict: {error_msg}")
        import traceback
        traceback.print_exc()
        log_request("/api/predict", response_time=response_time, status="error", error=error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/simulate", tags=["Simulation"])
async def simulate(request: SimulationRequest):
    """
    What-if scenario simulation endpoint
    
    Simulate the impact of operational changes on emissions
    """
    start_time = time.time()
    
    try:
        # Get dataset path
        file_path = get_dataset_path(request.dataset_filename)
        
        # Validate CSV
        validate_csv_file(file_path)
        
        # Run simulation
        comparisons = run_simulation(request.dataset_filename, request.modifications)
        
        # Format response
        formatted_data = convert_simulation_to_schema(comparisons, request.modifications)
        
        # Log request
        response_time = time.time() - start_time
        log_request("/api/simulate", response_time=response_time)
        
        return format_success_response(formatted_data)
    
    except HTTPException as he:
        response_time = time.time() - start_time
        log_request("/api/simulate", response_time=response_time, status="error", error=he.detail)
        raise he
    
    except Exception as e:
        response_time = time.time() - start_time
        error_msg = f"Simulation failed: {str(e)}"
        log_request("/api/simulate", response_time=response_time, status="error", error=error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/ranking", tags=["Analysis"])
async def get_ranking():
    """
    Industry ranking endpoint
    
    Get current industry rankings by emission risk
    """
    start_time = time.time()
    
    try:
        # Check if registry exists
        if not os.path.exists(REGISTRY_FILE):
            raise HTTPException(
                status_code=404,
                detail="Registry not found. Run prediction first to generate registry."
            )
        
        # Load registry
        registry = pd.read_csv(REGISTRY_FILE)
        registry = registry.sort_values("Latest_Composite_Index", ascending=False)
        registry["Rank"] = range(1, len(registry) + 1)
        
        # Get top 5 risky and safe industries
        top_5_risky = registry.head(5)["Industry_ID"].tolist()
        safe_industries = registry[registry["Alert_Level"] == "Low"]["Industry_ID"].tolist()
        
        # Format response
        formatted_data = {
            "ranking": registry.to_dict('records'),
            "registry_size": len(registry),
            "top_5_risky": top_5_risky,
            "safe_industries": safe_industries
        }
        
        # Log request
        response_time = time.time() - start_time
        log_request("/api/ranking", response_time=response_time)
        
        return format_success_response(formatted_data)
    
    except HTTPException as he:
        response_time = time.time() - start_time
        log_request("/api/ranking", response_time=response_time, status="error", error=he.detail)
        raise he
    
    except Exception as e:
        response_time = time.time() - start_time
        error_msg = f"Ranking retrieval failed: {str(e)}"
        log_request("/api/ranking", response_time=response_time, status="error", error=error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/trend/{industry_id}", tags=["Analysis"])
async def get_trend(industry_id: str):
    """
    Trend history endpoint
    
    Get historical composite index trend for a specific industry
    """
    start_time = time.time()
    
    try:
        # Check if trend file exists
        if not os.path.exists(TREND_FILE):
            raise HTTPException(
                status_code=404,
                detail="Trend history not found. Run predictions to generate trend data."
            )
        
        # Load trend data
        trend = pd.read_csv(TREND_FILE)
        
        # Convert industry_id to appropriate type for comparison
        try:
            industry_id_numeric = int(industry_id)
            industry_trend = trend[trend["Industry_ID"] == industry_id_numeric]
        except ValueError:
            # If conversion fails, try string comparison
            industry_trend = trend[trend["Industry_ID"].astype(str) == industry_id]
        
        if len(industry_trend) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"No trend data found for industry '{industry_id}'"
            )
        
        # Sort by date
        industry_trend = industry_trend.sort_values("Date")
        
        # Format response
        formatted_data = convert_trend_to_schema(industry_trend, industry_id)
        
        # Log request
        response_time = time.time() - start_time
        log_request("/api/trend", industry_id=industry_id, response_time=response_time)
        
        return format_success_response(formatted_data)
    
    except HTTPException as he:
        response_time = time.time() - start_time
        log_request("/api/trend", industry_id=industry_id, response_time=response_time, status="error", error=he.detail)
        raise he
    
    except Exception as e:
        response_time = time.time() - start_time
        error_msg = f"Trend retrieval failed: {str(e)}"
        log_request("/api/trend", industry_id=industry_id, response_time=response_time, status="error", error=error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/guidelines", tags=["Reference"])
async def get_guidelines():
    """
    Guidelines endpoint
    
    Get regulatory limits, thresholds, and category mappings
    """
    start_time = time.time()
    
    try:
        guidelines = {
            "regulatory_limits": REGULATORY_LIMITS,
            "composite_weights": COMPOSITE_WEIGHTS,
            "alert_levels": {
                "low": f"< {ALERT_THRESHOLDS['low']}",
                "moderate": f"{ALERT_THRESHOLDS['low']} - {ALERT_THRESHOLDS['moderate']}",
                "critical": f"> {ALERT_THRESHOLDS['moderate']}"
            },
            "regulatory_categories": {
                "sustainable": f"< {REGULATORY_THRESHOLDS['sustainable']}",
                "watchlist": f"{REGULATORY_THRESHOLDS['sustainable']} - {REGULATORY_THRESHOLDS['watchlist']}",
                "risk": f"{REGULATORY_THRESHOLDS['watchlist']} - {REGULATORY_THRESHOLDS['risk']}",
                "critical": f"> {REGULATORY_THRESHOLDS['risk']}"
            },
            "quality_levels": {
                "high_reliability": f"> {QUALITY_THRESHOLDS['high']}%",
                "moderate": f"{QUALITY_THRESHOLDS['moderate']}% - {QUALITY_THRESHOLDS['high']}%",
                "low": f"< {QUALITY_THRESHOLDS['moderate']}%"
            }
        }
        
        # Log request
        response_time = time.time() - start_time
        log_request("/api/guidelines", response_time=response_time)
        
        return format_success_response(guidelines)
    
    except Exception as e:
        response_time = time.time() - start_time
        error_msg = f"Guidelines retrieval failed: {str(e)}"
        log_request("/api/guidelines", response_time=response_time, status="error", error=error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content=format_error_response("Resource not found")
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors"""
    return JSONResponse(
        status_code=500,
        content=format_error_response("Internal server error")
    )

# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@app.get("/", tags=["System"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": "EnviroGuard Backend API",
        "version": SERVER_VERSION,
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "health": "/api/health",
            "predict": "/api/predict",
            "simulate": "/api/simulate",
            "ranking": "/api/ranking",
            "trend": "/api/trend/{industry_id}",
            "guidelines": "/api/guidelines"
        }
    }

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=4001,
        reload=True
    )
