import pandas as pd
import numpy as np
import joblib
import os
import sys
from validator import validate_and_clean, align_features

# Directory setup
DATA_DIR = "dataset"
MODEL_DIR = "emission_model"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

def forecast_emissions(dataset_filename):
    """
    Forecast next month emissions for all industries
    Auto-detects whether to use lag-based or cold-start model
    """
    
    # Load dataset
    df = pd.read_csv(os.path.join(DATA_DIR, dataset_filename))
    
    # Load training stats
    training_stats = joblib.load(os.path.join(MODEL_DIR, "training_stats.pkl"))
    
    # Validate and clean
    df, ood_flags, missing_ratio, has_emissions = validate_and_clean(df, training_stats)
    
    print(f"\n===== FORECAST CONFIGURATION =====")
    print(f"Dataset: {dataset_filename}")
    print(f"Has emission history: {has_emissions}")
    print(f"Missing ratio: {missing_ratio:.2%}")
    print(f"OOD features detected: {len(ood_flags)}")
    
    # Select model based on emission history
    if has_emissions:
        print("Using: LAG-BASED MODEL")
        model = joblib.load(os.path.join(MODEL_DIR, "multi_emission_model.pkl"))
        use_lag = True
    else:
        print("Using: COLD-START MODEL")
        model = joblib.load(os.path.join(MODEL_DIR, "multi_emission_cold_model.pkl"))
        use_lag = False
    
    # Load feature columns
    feature_columns = joblib.load(os.path.join(MODEL_DIR, "feature_columns.pkl"))
    
    # Extract latest row per industry
    df = df.sort_values("Date")
    latest_df = df.groupby("Industry_ID").tail(1).reset_index(drop=True)
    
    # Generate lag features if using lag model
    if use_lag and has_emissions:
        latest_df["CO2_Lag_1"] = df.groupby("Industry_ID")["CO2"].shift(1).iloc[-len(latest_df):]
        latest_df["SO2_Lag_1"] = df.groupby("Industry_ID")["SO2"].shift(1).iloc[-len(latest_df):]
        latest_df["BOD_Lag_1"] = df.groupby("Industry_ID")["BOD"].shift(1).iloc[-len(latest_df):]
        latest_df["COD_Lag_1"] = df.groupby("Industry_ID")["COD"].shift(1).iloc[-len(latest_df):]
        
        # Fill NaN lags with current values
        latest_df["CO2_Lag_1"].fillna(latest_df["CO2"], inplace=True)
        latest_df["SO2_Lag_1"].fillna(latest_df["SO2"], inplace=True)
        latest_df["BOD_Lag_1"].fillna(latest_df["BOD"], inplace=True)
        latest_df["COD_Lag_1"].fillna(latest_df["COD"], inplace=True)
    
    # Encode categorical
    latest_df = pd.get_dummies(latest_df, columns=["Industry_Type", "Fuel_Type"], drop_first=True)
    
    # Align features
    X = align_features(latest_df, feature_columns)
    
    # Predict
    predictions = model.predict(X)
    
    # Generate predicted dates (next month)
    predicted_dates = pd.to_datetime(latest_df["Date"]) + pd.DateOffset(months=1)
    
    # Build result structure
    results = []
    for i, industry_id in enumerate(latest_df["Industry_ID"]):
        result = {
            "Industry_ID": industry_id,
            "Predicted_Date": predicted_dates.iloc[i].strftime("%Y-%m-%d"),
            "CO2": float(predictions[i][0]),
            "SO2": float(predictions[i][1]),
            "BOD": float(predictions[i][2]),
            "COD": float(predictions[i][3]),
            "Model_Type": "Lag-Based" if use_lag else "Cold-Start",
            "OOD_Count": len(ood_flags),
            "Missing_Ratio": missing_ratio
        }
        results.append(result)
    
    return results, ood_flags, missing_ratio

if __name__ == "__main__":
    if len(sys.argv) > 1:
        dataset_file = sys.argv[1]
    else:
        dataset_file = "master_training_dataset.csv"
    
    results, ood_flags, missing_ratio = forecast_emissions(dataset_file)
    
    print(f"\n===== FORECAST RESULTS =====")
    for i, result in enumerate(results[:5]):  # Show first 5
        print(f"\nIndustry {result['Industry_ID']}")
        print(f"  Predicted Date: {result['Predicted_Date']}")
        print(f"  CO2: {result['CO2']:.2f}")
        print(f"  SO2: {result['SO2']:.2f}")
        print(f"  BOD: {result['BOD']:.2f}")
        print(f"  COD: {result['COD']:.2f}")
    
    if len(results) > 5:
        print(f"\n... and {len(results) - 5} more industries")
