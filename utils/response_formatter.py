"""
Response formatting utilities for EnviroGuard Backend
"""
from datetime import datetime
from typing import Any, Optional
from schemas import APIResponse

def format_success_response(data: Any) -> dict:
    """
    Format successful API response
    
    Args:
        data: Response data
        
    Returns:
        dict: Formatted response
    """
    return {
        "success": True,
        "data": data,
        "error": None,
        "timestamp": datetime.now().isoformat()
    }

def format_error_response(error_message: str) -> dict:
    """
    Format error API response
    
    Args:
        error_message: Error message
        
    Returns:
        dict: Formatted error response
    """
    return {
        "success": False,
        "data": None,
        "error": error_message,
        "timestamp": datetime.now().isoformat()
    }

def convert_prediction_to_schema(prediction_result: dict) -> dict:
    """
    Convert prediction result to API schema format
    
    Args:
        prediction_result: Raw prediction result from predict.py
        
    Returns:
        dict: Formatted prediction response
    """
    return {
        "predictions": prediction_result.get("predictions", []),
        "summary": prediction_result.get("summary", {}),
        "top_5_risky": prediction_result.get("top_5_risky", []),
        "safe_industries": prediction_result.get("safe_industries", [])
    }

def convert_simulation_to_schema(simulation_result: list, modifications: dict) -> dict:
    """
    Convert simulation result to API schema format
    
    Args:
        simulation_result: Raw simulation result
        modifications: Applied modifications
        
    Returns:
        dict: Formatted simulation response
    """
    return {
        "comparisons": simulation_result,
        "modifications_applied": modifications,
        "total_industries": len(simulation_result)
    }

def convert_ranking_to_schema(ranking_df, top_5_risky: list, safe_industries: list) -> dict:
    """
    Convert ranking result to API schema format
    
    Args:
        ranking_df: Ranking dataframe
        top_5_risky: Top 5 risky industries
        safe_industries: Safe industries list
        
    Returns:
        dict: Formatted ranking response
    """
    ranking_list = ranking_df.to_dict('records')
    
    return {
        "ranking": ranking_list,
        "registry_size": len(ranking_df),
        "top_5_risky": top_5_risky,
        "safe_industries": safe_industries
    }

def convert_trend_to_schema(trend_df, industry_id: str) -> dict:
    """
    Convert trend data to API schema format
    
    Args:
        trend_df: Trend dataframe
        industry_id: Industry ID
        
    Returns:
        dict: Formatted trend response
    """
    trend_list = trend_df.to_dict('records')
    
    # Calculate trend direction
    trend_direction = None
    first_index = None
    last_index = None
    
    if len(trend_list) >= 2:
        first_index = trend_list[0]["Composite_Index"]
        last_index = trend_list[-1]["Composite_Index"]
        trend_direction = "improving" if last_index < first_index else "worsening"
    
    return {
        "industry_id": industry_id,
        "trend_data": trend_list,
        "total_records": len(trend_list),
        "first_index": first_index,
        "last_index": last_index,
        "trend_direction": trend_direction
    }
