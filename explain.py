import pandas as pd
import numpy as np
import joblib
import shap
import os

# Directory setup
DATA_DIR = "dataset"
MODEL_DIR = "emission_model"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

def explain_prediction(X_sample, pollutant, model_type="lag"):
    """
    Generate SHAP-based explanation for a specific pollutant prediction
    
    pollutant: "CO2", "SO2", "BOD", or "COD"
    model_type: "lag" or "cold"
    """
    
    # Load appropriate model
    if model_type == "lag":
        model = joblib.load(os.path.join(MODEL_DIR, "multi_emission_model.pkl"))
    else:
        model = joblib.load(os.path.join(MODEL_DIR, "multi_emission_cold_model.pkl"))
    
    # Get specific pollutant model
    pollutant_index = {"CO2": 0, "SO2": 1, "BOD": 2, "COD": 3}
    idx = pollutant_index[pollutant]
    pollutant_model = model.estimators_[idx]
    
    # Create SHAP explainer
    explainer = shap.TreeExplainer(pollutant_model)
    shap_values = explainer.shap_values(X_sample)
    
    # Extract feature contributions
    feature_names = X_sample.columns
    contributions = list(zip(feature_names, shap_values[0]))
    
    # Filter positive contributors only
    positive_contributors = [
        (feature, value) for feature, value in contributions if value > 0
    ]
    
    # Sort by contribution magnitude
    positive_sorted = sorted(
        positive_contributors,
        key=lambda x: x[1],
        reverse=True
    )
    
    if len(positive_sorted) == 0:
        return {
            "primary_driver": "No dominant positive contributor",
            "top_features": [],
            "contribution_values": []
        }
    
    # Extract top features
    top_features = [f[0] for f in positive_sorted[:5]]
    contribution_values = [float(f[1]) for f in positive_sorted[:5]]
    primary_driver = top_features[0]
    
    return {
        "primary_driver": primary_driver,
        "top_features": top_features,
        "contribution_values": contribution_values
    }

def get_recommendation(primary_driver):
    """Generate feature-specific mitigation recommendation"""
    
    if "Production" in primary_driver:
        return "Optimize production efficiency and reduce process waste."
    
    elif "Fuel_Type" in primary_driver:
        return "Switch to cleaner fuel alternatives or optimize combustion process."
    
    elif "Lag" in primary_driver:
        return "Historical emission trend driving risk → initiate emission stabilization program."
    
    elif "Treatment" in primary_driver:
        return "Upgrade wastewater treatment efficiency (ETP optimization)."
    
    elif "Equipment_Age" in primary_driver:
        return "Upgrade aging equipment to reduce emission intensity."
    
    elif "Operating_Hours" in primary_driver:
        return "Optimize operational scheduling to reduce emission load."
    
    elif "Capacity_Utilization" in primary_driver:
        return "Balance capacity utilization to minimize emission spikes."
    
    elif "Temperature" in primary_driver or "Humidity" in primary_driver:
        return "Weather-driven emissions → implement adaptive control systems."
    
    else:
        return "Conduct technical audit to optimize operational parameters."

if __name__ == "__main__":
    # Test explanation module
    import sys
    from validator import validate_and_clean, align_features
    
    # Load test data
    df = pd.read_csv(os.path.join(DATA_DIR, "master_training_dataset.csv"))
    df, _, _, has_emissions = validate_and_clean(df, None)
    
    # Prepare sample
    df = df.sort_values("Date")
    latest = df.groupby("Industry_ID").tail(1).reset_index(drop=True)
    
    if has_emissions:
        latest["CO2_Lag_1"] = df.groupby("Industry_ID")["CO2"].shift(1).iloc[-len(latest):]
        latest["SO2_Lag_1"] = df.groupby("Industry_ID")["SO2"].shift(1).iloc[-len(latest):]
        latest["BOD_Lag_1"] = df.groupby("Industry_ID")["BOD"].shift(1).iloc[-len(latest):]
        latest["COD_Lag_1"] = df.groupby("Industry_ID")["COD"].shift(1).iloc[-len(latest):]
        latest.fillna(method='ffill', inplace=True)
    
    latest = pd.get_dummies(latest, columns=["Industry_Type", "Fuel_Type"], drop_first=True)
    
    feature_columns = joblib.load(os.path.join(MODEL_DIR, "feature_columns.pkl"))
    X = align_features(latest, feature_columns)
    
    # Explain first sample
    sample = X.iloc[[0]]
    explanation = explain_prediction(sample, "CO2", "lag")
    
    print("\n===== SHAP EXPLANATION =====")
    print(f"Primary Driver: {explanation['primary_driver']}")
    print(f"\nTop Contributing Features:")
    for feat, val in zip(explanation['top_features'], explanation['contribution_values']):
        print(f"  {feat}: +{val:.3f}")
    
    print(f"\nRecommendation: {get_recommendation(explanation['primary_driver'])}")
