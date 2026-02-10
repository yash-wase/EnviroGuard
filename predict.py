import pandas as pd
import numpy as np
import joblib
import os
import sys
from forecast import forecast_emissions
from ranking import compute_industry_ranking, get_risk_summary
from explain import explain_prediction, get_recommendation
from visualization import plot_severity_ranking, plot_composite_index_trend, plot_risk_vs_target, plot_industry_ranking
from validator import align_features

DATA_DIR = "dataset"
MODEL_DIR = "emission_model"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

def compute_confidence(ood_count, missing_ratio, model_type):
    base_confidence = 100.0
    ood_penalty = min(ood_count * 5, 30)
    missing_penalty = missing_ratio * 50
    cold_start_penalty = 15 if model_type == "Cold-Start" else 0
    confidence = base_confidence - ood_penalty - missing_penalty - cold_start_penalty
    return max(confidence, 0)

def get_alert_level(composite_index):
    if composite_index < 0.4:
        return "Low"
    elif composite_index < 0.7:
        return "Moderate"
    else:
        return "Critical"

def compute_risk_vs_target(forecast_result):
    limits = {"CO2": 5000, "SO2": 80, "BOD": 250, "COD": 500}
    risk_analysis = {}
    for pollutant in ["CO2", "SO2", "BOD", "COD"]:
        predicted = forecast_result[pollutant]
        limit = limits[pollutant]
        risk_pct = (predicted / limit) * 100
        remaining = limit - predicted
        over_limit = predicted > limit
        risk_analysis[pollutant] = {
            "Predicted": predicted,
            "Limit": limit,
            "Risk_Pct": risk_pct,
            "Remaining_Allowance": remaining,
            "Over_Limit": over_limit
        }
    return risk_analysis

def run_intelligent_prediction(dataset_filename, num_samples=5):
    print("\n" + "="*60)
    print("ENVIROGUARD EMISSION FORECASTING & INTELLIGENCE PLATFORM")
    print("="*60)
    
    print("\n[1/5] Running emission forecast...")
    forecast_results, ood_flags, missing_ratio = forecast_emissions(dataset_filename)
    
    print("\n[2/5] Computing industry ranking...")
    ranking_df, top_5_risky, safe_industries = compute_industry_ranking(dataset_filename)
    summary = get_risk_summary(ranking_df)
    
    print("\n[3/5] Generating visualizations...")
    plot_composite_index_trend(forecast_results)
    plot_industry_ranking(ranking_df)
    
    print(f"\n[4/5] Analyzing top {num_samples} industries...")
    
    limits = {"CO2": 5000, "SO2": 80, "BOD": 250, "COD": 500}
    weights = {"CO2": 0.30, "SO2": 0.25, "BOD": 0.25, "COD": 0.20}
    
    model_type = forecast_results[0]["Model_Type"]
    if model_type == "Lag-Based":
        model = joblib.load(os.path.join(MODEL_DIR, "multi_emission_model.pkl"))
    else:
        model = joblib.load(os.path.join(MODEL_DIR, "multi_emission_cold_model.pkl"))
    
    feature_columns = joblib.load(os.path.join(MODEL_DIR, "feature_columns.pkl"))
    
    df = pd.read_csv(os.path.join(DATA_DIR, dataset_filename))
    df["Date"] = pd.to_datetime(df["Date"], dayfirst=True)
    df = df.sort_values("Date")
    
    if "Fuel_Consumption" in df.columns:
        df = df.drop(columns=["Fuel_Consumption"])
    
    latest_df = df.groupby("Industry_ID").tail(1).reset_index(drop=True)
    
    if model_type == "Lag-Based":
        latest_df["CO2_Lag_1"] = df.groupby("Industry_ID")["CO2"].shift(1).iloc[-len(latest_df):]
        latest_df["SO2_Lag_1"] = df.groupby("Industry_ID")["SO2"].shift(1).iloc[-len(latest_df):]
        latest_df["BOD_Lag_1"] = df.groupby("Industry_ID")["BOD"].shift(1).iloc[-len(latest_df):]
        latest_df["COD_Lag_1"] = df.groupby("Industry_ID")["COD"].shift(1).iloc[-len(latest_df):]
        latest_df.fillna(method='ffill', inplace=True)
    
    latest_df = pd.get_dummies(latest_df, columns=["Industry_Type", "Fuel_Type"], drop_first=True)
    X = align_features(latest_df, feature_columns)
    
    print("\n[5/5] Generating intelligent reports...")
    print("\n" + "="*60)
    print("DETAILED EMISSION INTELLIGENCE REPORT")
    print("="*60)
    
    for i, result in enumerate(forecast_results[:num_samples]):
        print(f"\n{'='*60}")
        print(f"INDUSTRY {result['Industry_ID']} - FORECAST ANALYSIS")
        print(f"{'='*60}")
        
        print(f"\nPredicted Date: {result['Predicted_Date']}")
        print(f"Model Used: {result['Model_Type']}")
        print(f"\nEmission Forecast:")
        print(f"  CO2: {result['CO2']:.2f} kg")
        print(f"  SO2: {result['SO2']:.2f} kg")
        print(f"  BOD: {result['BOD']:.2f} mg/L")
        print(f"  COD: {result['COD']:.2f} mg/L")
        
        composite_index = sum(weights[p] * (result[p] / limits[p]) for p in ["CO2", "SO2", "BOD", "COD"])
        alert_level = get_alert_level(composite_index)
        
        print(f"\nComposite Emission Index: {composite_index:.3f}")
        print(f"Alert Level: {alert_level}")
        
        confidence = compute_confidence(result['OOD_Count'], result['Missing_Ratio'], result['Model_Type'])
        print(f"Prediction Confidence: {confidence:.1f}%")
        
        print(f"\n--- Risk vs Target Analysis ---")
        risk_analysis = compute_risk_vs_target(result)
        
        for pollutant in ["CO2", "SO2", "BOD", "COD"]:
            ra = risk_analysis[pollutant]
            status = " OVER LIMIT" if ra["Over_Limit"] else " Within Limit"
            print(f"\n{pollutant}:")
            print(f"  Predicted: {ra['Predicted']:.2f}")
            print(f"  Limit: {ra['Limit']:.2f}")
            print(f"  Risk: {ra['Risk_Pct']:.1f}% of limit")
            print(f"  Remaining: {ra['Remaining_Allowance']:.2f}")
            print(f"  Status: {status}")
        
        normalized = {p: result[p] / limits[p] for p in ["CO2", "SO2", "BOD", "COD"]}
        ranked = sorted(normalized.items(), key=lambda x: x[1], reverse=True)
        
        print(f"\n--- Severity Ranking ---")
        for rank, (pollutant, value) in enumerate(ranked, start=1):
            print(f"{rank}. {pollutant}  {value:.3f} ({value*100:.1f}% of limit)")
        
        plot_severity_ranking(result)
        plot_risk_vs_target(result)
        
        if alert_level in ["Moderate", "Critical"]:
            top_pollutant = ranked[0][0]
            print(f"\n--- Root Cause Analysis ({top_pollutant}) ---")
            try:
                sample = X.iloc[[i]]
                explanation = explain_prediction(sample, top_pollutant, "lag" if model_type == "Lag-Based" else "cold")
                print(f"Primary Driver: {explanation['primary_driver']}")
                print(f"\nTop Contributing Features:")
                for feat, val in zip(explanation['top_features'][:3], explanation['contribution_values'][:3]):
                    print(f"   {feat}: +{val:.3f}")
                recommendation = get_recommendation(explanation['primary_driver'])
                print(f"\n--- Recommended Action ---")
                print(f" {recommendation}")
            except Exception as e:
                print(f"SHAP analysis skipped: {str(e)}")
        else:
            print(f"\n Emissions within safe limits. Continue monitoring.")
    
    print(f"\n{'='*60}")
    print("SYSTEM-WIDE SUMMARY")
    print(f"{'='*60}")
    print(f"\nTotal Industries Analyzed: {summary['Total_Industries']}")
    print(f"  Critical: {summary['Critical_Count']}")
    print(f"  Moderate: {summary['Moderate_Count']}")
    print(f"  Low: {summary['Low_Count']}")
    print(f"\nAverage Composite Index: {summary['Average_Composite_Index']:.3f}")
    print(f"Industries Over Limit: {summary['Industries_Over_Limit']}")
    print(f"\nTop 5 Risky Industries: {top_5_risky}")
    print(f"Safe Industries: {len(safe_industries)} total")
    print(f"\n{'='*60}")
    print(" Analysis complete. Visualizations saved to dataset/")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        dataset_file = sys.argv[1]
    else:
        dataset_file = "master_training_dataset.csv"
    run_intelligent_prediction(dataset_file, num_samples=5)
