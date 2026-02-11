"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class SimulationRequest(BaseModel):
    dataset_filename: str = Field(..., description="Name of the dataset file in dataset/ folder")
    modifications: Dict[str, float] = Field(..., description="Parameter modifications")
    
    class Config:
        json_schema_extra = {
            "example": {
                "dataset_filename": "master_training_dataset.csv",
                "modifications": {
                    "Production_Volume": 1.1,
                    "Treatment_Efficiency": 85
                }
            }
        }

# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    models_loaded: bool

class ForecastData(BaseModel):
    predicted_date: str
    CO2: float
    SO2: float
    BOD: float
    COD: float
    model_type: str

class RiskAnalysis(BaseModel):
    Predicted: float
    Limit: float
    Risk_Pct: float
    Remaining_Allowance: float
    Over_Limit: bool

class SeverityItem(BaseModel):
    pollutant: str
    normalized: float
    percentage: float

class MitigationImpact(BaseModel):
    current_index: float
    projected_index: float
    improvement_percentage: float
    countermeasure: str

class RecommendationData(BaseModel):
    primary_driver: Optional[str]
    action: Optional[str]
    explanation: Optional[Dict[str, Any]]
    mitigation_impact: Optional[MitigationImpact]

class PredictionItem(BaseModel):
    industry_id: str
    forecast: ForecastData
    risk_vs_target: Dict[str, RiskAnalysis]
    severity_ranking: List[SeverityItem]
    composite_index: float
    alert_level: str
    confidence: float
    dataset_quality: str
    regulatory_category: str
    ranking_position: Optional[int]
    registry_size: int
    escalation: bool
    escalation_action: Optional[str]
    recommendation: RecommendationData

class SummaryData(BaseModel):
    Total_Industries: int
    Critical_Count: int
    Moderate_Count: int
    Low_Count: int
    Average_Composite_Index: float
    Max_Composite_Index: float
    Industries_Over_Limit: int
    Registry_Size: int

class PredictionResponse(BaseModel):
    predictions: List[PredictionItem]
    summary: SummaryData
    top_5_risky: List[str]
    safe_industries: List[str]

class SimulationComparison(BaseModel):
    Industry_ID: str
    Baseline_CO2: float
    Scenario_CO2: float
    Delta_CO2: float
    Baseline_SO2: float
    Scenario_SO2: float
    Delta_SO2: float
    Baseline_BOD: float
    Scenario_BOD: float
    Delta_BOD: float
    Baseline_COD: float
    Scenario_COD: float
    Delta_COD: float
    Baseline_Index: float
    Scenario_Index: float
    Delta_Index: float

class SimulationResponse(BaseModel):
    comparisons: List[SimulationComparison]
    modifications_applied: Dict[str, float]
    total_industries: int

class RankingItem(BaseModel):
    Industry_ID: str
    Composite_Index: float
    Average_Risk_Pct: float
    Max_Risk_Pct: float
    Alert_Level: str
    Over_Limit_Count: int
    Rank: int

class RankingResponse(BaseModel):
    ranking: List[RankingItem]
    registry_size: int
    top_5_risky: List[str]
    safe_industries: List[str]

class TrendItem(BaseModel):
    Industry_ID: str
    Composite_Index: float
    Date: str

class TrendResponse(BaseModel):
    industry_id: str
    trend_data: List[TrendItem]
    total_records: int
    first_index: Optional[float]
    last_index: Optional[float]
    trend_direction: Optional[str]

class GuidelinesResponse(BaseModel):
    regulatory_limits: Dict[str, float]
    composite_weights: Dict[str, float]
    alert_levels: Dict[str, str]
    regulatory_categories: Dict[str, str]
    quality_levels: Dict[str, str]

# ============================================================================
# STANDARD API RESPONSE WRAPPER
# ============================================================================

class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {},
                "error": None,
                "timestamp": "2024-01-15T10:30:00"
            }
        }
