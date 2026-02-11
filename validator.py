import pandas as pd
import numpy as np
import joblib
import os

# Directory setup
DATA_DIR = "dataset"
MODEL_DIR = "emission_model"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

def validate_and_clean(df, training_stats=None):
    """
    Validate and clean input dataframe
    Returns: cleaned_df, ood_flags, missing_ratio
    """
    
    # Required columns
    required_cols = [
        "Industry_ID", "Date", "Production_Volume", "Fuel_Type",
        "Operating_Hours", "Equipment_Age", "Capacity_Utilization",
        "Treatment_Efficiency", "Industry_Type"
    ]
    
    # Check required columns
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        print(f"Warning: Missing required columns: {missing_cols}")
    
    # Convert Date
    if "Date" in df.columns:
        df["Date"] = pd.to_datetime(df["Date"], format='%Y-%m-%d', errors='coerce')
    
    # Impute missing numeric values with median
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df[col].isnull().any():
            median_val = df[col].median()
            df[col].fillna(median_val, inplace=True)
    
    # Calculate missing ratio
    total_cells = df.shape[0] * df.shape[1]
    missing_cells = df.isnull().sum().sum()
    missing_ratio = missing_cells / total_cells if total_cells > 0 else 0
    
    # Handle missing emission columns (for cold-start)
    emission_cols = ["CO2", "SO2", "BOD", "COD"]
    has_emissions = all(col in df.columns for col in emission_cols)
    
    # OOD detection
    ood_flags = {}
    if training_stats is not None:
        for col in numeric_cols:
            if col in training_stats:
                stats = training_stats[col]
                min_val = df[col].min()
                max_val = df[col].max()
                
                if min_val < stats["min"] or max_val > stats["max"]:
                    ood_flags[col] = {
                        "current_range": (float(min_val), float(max_val)),
                        "training_range": (stats["min"], stats["max"])
                    }
    
    # Detect extreme invalid values
    for col in numeric_cols:
        if col in df.columns:
            # Remove negative values for certain columns
            if col in ["Production_Volume", "Operating_Hours", "Equipment_Age", 
                       "Capacity_Utilization", "Treatment_Efficiency"]:
                df[col] = df[col].clip(lower=0)
            
            # Cap capacity utilization at 100%
            if col == "Capacity_Utilization":
                df[col] = df[col].clip(upper=100)
            
            # Cap treatment efficiency at 100%
            if col == "Treatment_Efficiency":
                df[col] = df[col].clip(upper=100)
    
    return df, ood_flags, missing_ratio, has_emissions

def align_features(df, feature_columns):
    """Align dataframe columns to match training feature order"""
    
    # Get current columns (excluding targets, date, and ID)
    current_cols = [col for col in df.columns if col not in 
                    ["CO2", "SO2", "BOD", "COD", "TSS", "pH", "Date", "Industry_ID"]]
    
    # Add missing columns with zeros
    for col in feature_columns:
        if col not in current_cols:
            df[col] = 0
    
    # Reorder to match training
    feature_df = df[feature_columns]
    
    return feature_df

def classify_dataset_quality(confidence_score):
    """
    Classify dataset quality based on confidence score
    
    Returns: High Reliability, Moderate, or Low
    """
    if confidence_score > 80:
        return "High Reliability"
    elif confidence_score >= 60:
        return "Moderate"
    else:
        return "Low"

if __name__ == "__main__":
    # Test validator
    test_df = pd.read_csv(os.path.join(DATA_DIR, "master_training_dataset.csv"))
    
    # Load training stats if available
    stats_path = os.path.join(MODEL_DIR, "training_stats.pkl")
    if os.path.exists(stats_path):
        training_stats = joblib.load(stats_path)
    else:
        training_stats = None
    
    cleaned_df, ood_flags, missing_ratio, has_emissions = validate_and_clean(
        test_df.copy(), training_stats
    )
    
    print(f"\n✓ Validation complete")
    print(f"Missing ratio: {missing_ratio:.2%}")
    print(f"Has emission history: {has_emissions}")
    print(f"OOD flags: {len(ood_flags)} features")
