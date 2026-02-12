import pandas as pd
import numpy as np
import os
import sys
from forecast import forecast_emissions

# Directory setup
DATA_DIR = "dataset"
UPLOAD_DIR = "dataset/uploads"
MODEL_DIR = "emission_model"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

def get_dataset_path(filename):
    """Get full path to dataset file, checking uploads first"""
    # Check in uploads directory first
    upload_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(upload_path):
        return upload_path
    
    # Check in main dataset directory
    dataset_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(dataset_path):
        return dataset_path
    
    raise FileNotFoundError(f"Dataset file '{filename}' not found")

def project_countermeasure_impact(dataset_filename, industry_id, primary_driver):
    """
    Project impact of countermeasure based on primary driver
    
    Returns:
        {
            "current_index": float,
            "projected_index": float,
            "improvement_percentage": float,
            "countermeasure": str
        }
    """
    
    # Load dataset using proper path resolution
    file_path = get_dataset_path(dataset_filename)
    
    # Try reading CSV with different formats
    try:
        df = pd.read_csv(file_path)
    except:
        try:
            df = pd.read_csv(file_path, sep=';')
        except:
            try:
                df = pd.read_csv(file_path, encoding='latin-1')
            except:
                df = pd.read_csv(file_path, sep=';', encoding='latin-1')
    
    # Get baseline forecast
    baseline_results, _, _ = forecast_emissions(dataset_filename)
    
    # Find current industry result
    current_result = None
    for result in baseline_results:
        if result["Industry_ID"] == industry_id:
            current_result = result
            break
    
    if current_result is None:
        return None
    
    # Calculate current composite index
    limits = {"CO2": 5000, "SO2": 80, "BOD": 250, "COD": 500}
    weights = {"CO2": 0.30, "SO2": 0.25, "BOD": 0.25, "COD": 0.20}
    
    current_index = sum(
        weights[p] * (current_result[p] / limits[p]) 
        for p in ["CO2", "SO2", "BOD", "COD"]
    )
    
    # Determine countermeasure based on primary driver
    countermeasure = ""
    modifications = {}
    
    if "Production" in primary_driver:
        modifications["Production_Volume"] = 0.9  # 10% reduction
        countermeasure = "Reduce production volume by 10%"
    
    elif "Treatment" in primary_driver:
        # Get current treatment efficiency and increase by 10%
        industry_df = df[df["Industry_ID"] == industry_id]
        if len(industry_df) > 0:
            current_efficiency = industry_df["Treatment_Efficiency"].iloc[-1]
            new_efficiency = min(current_efficiency + 10, 100)
            modifications["Treatment_Efficiency"] = new_efficiency
            countermeasure = f"Increase treatment efficiency to {new_efficiency}%"
    
    elif "Fuel_Type" in primary_driver:
        # Switch to Natural Gas (cleaner fuel)
        df.loc[df["Industry_ID"] == industry_id, "Fuel_Type"] = "Natural Gas"
        countermeasure = "Switch to Natural Gas fuel"
    
    elif "Equipment_Age" in primary_driver:
        modifications["Equipment_Age"] = 0.7  # Reduce age by 30%
        countermeasure = "Upgrade equipment (reduce age by 30%)"
    
    elif "Operating_Hours" in primary_driver:
        modifications["Operating_Hours"] = 0.9  # 10% reduction
        countermeasure = "Optimize operating hours (reduce by 10%)"
    
    elif "Capacity_Utilization" in primary_driver:
        modifications["Capacity_Utilization"] = 0.9  # 10% reduction
        countermeasure = "Reduce capacity utilization by 10%"
    
    else:
        # Generic improvement
        modifications["Production_Volume"] = 0.95
        countermeasure = "Optimize operational parameters (5% production reduction)"
    
    # Apply modifications
    for param, value in modifications.items():
        if param in df.columns:
            if isinstance(value, float) and value < 1:
                # Multiplier
                df.loc[df["Industry_ID"] == industry_id, param] *= value
            else:
                # Absolute value
                df.loc[df["Industry_ID"] == industry_id, param] = value
    
    # Save modified dataset temporarily
    temp_file = "temp_mitigation.csv"
    df.to_csv(os.path.join(DATA_DIR, temp_file), index=False)
    
    # Get projected forecast
    try:
        projected_results, _, _ = forecast_emissions(temp_file)
        
        # Find projected industry result
        projected_result = None
        for result in projected_results:
            if result["Industry_ID"] == industry_id:
                projected_result = result
                break
        
        if projected_result is None:
            return None
        
        # Calculate projected composite index
        projected_index = sum(
            weights[p] * (projected_result[p] / limits[p]) 
            for p in ["CO2", "SO2", "BOD", "COD"]
        )
        
        # Calculate improvement
        improvement_percentage = ((current_index - projected_index) / current_index) * 100
        
        return {
            "current_index": float(current_index),
            "projected_index": float(projected_index),
            "improvement_percentage": float(improvement_percentage),
            "countermeasure": countermeasure
        }
    
    finally:
        # Clean up temp file
        temp_path = os.path.join(DATA_DIR, temp_file)
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    if len(sys.argv) > 2:
        dataset_file = sys.argv[1]
        industry_id = sys.argv[2]
        primary_driver = sys.argv[3] if len(sys.argv) > 3 else "Production_Volume"
    else:
        dataset_file = "master_training_dataset.csv"
        industry_id = "IND001"
        primary_driver = "Production_Volume"
    
    impact = project_countermeasure_impact(dataset_file, industry_id, primary_driver)
    
    if impact:
        print(f"\n===== COUNTERMEASURE IMPACT PROJECTION =====")
        print(f"Industry: {industry_id}")
        print(f"Countermeasure: {impact['countermeasure']}")
        print(f"Current Index: {impact['current_index']:.3f}")
        print(f"Projected Index: {impact['projected_index']:.3f}")
        print(f"Improvement: {impact['improvement_percentage']:.1f}%")
