import pandas as pd
import numpy as np
import joblib
import os
import sys
from datetime import datetime
from forecast import forecast_emissions
from ranking import compute_industry_ranking, get_risk_summary, classify_regulatory_category, get_registry_ranking
from explain import explain_prediction, get_recommendation
from mitigation import project_countermeasure_impact
from visualization import plot_severity_ranking, plot_composite_index_trend, plot_risk_vs_target, plot_industry_ranking
from validator import align_features, classify_dataset_quality

DATA_DIR = "dataset"
MODEL_DIR = "emission_model"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

MONITORING_FILE = os.path.join(DATA_DIR, "model_monitoring.csv")

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

def log_model_monitoring(industry_id, predicted_co2, predicted_so2, predicted_bod, predicted_cod, actual_values=None):
    """
    Log model predictions and actuals (if available) for drift monitoring
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Load or create monitoring log
    if os.path.exists(MONITORING_FILE):
        monitoring = pd.read_csv(MONITORING_FILE)
    else:
        monitoring = pd.DataFrame(columns=[
            "Industry_ID", "Predicted_CO2", "Predicted_SO2", "Predicted_BOD", "Predicted_COD",
            "Actual_CO2", "Actual_SO2", "Actual_BOD", "Actual_COD",
            "Error_CO2", "Error_SO2", "Error_BOD", "Error_COD", "Date"
        ])
    
    # Prepare record
    record = {
        "Industry_ID": industry_id,
        "Predicted_CO2": predicted_co2,
        "Predicted_SO2": predicted_so2,
        "Predicted_BOD": predicted_bod,
        "Predicted_COD": predicted_cod,
        "Actual_CO2": None,
        "Actual_SO2": None,
        "Actual_BOD": None,
        "Actual_COD": None,
        "Error_CO2": None,
        "Error_SO2": None,
        "Error_BOD": None,
        "Error_COD": None,
        "Date": timestamp
    }
    
    # If actual values provided, compute errors
    if actual_values:
        record["Actual_CO2"] = actual_values.get("CO2")
        record["Actual_SO2"] = actual_values.get("SO2")
        record["Actual_BOD"] = actual_values.get("BOD")
        record["Actual_COD"] = actual_values.get("COD")
        
        if record["Actual_CO2"] is not None:
            record["Error_CO2"] = abs(predicted_co2 - record["Actual_CO2"])
        if record["Actual_SO2"] is not None:
            record["Error_SO2"] = abs(predicted_so2 - record["Actual_SO2"])
        if record["Actual_BOD"] is not None:
            record["Error_BOD"] = abs(predicted_bod - record["Actual_BOD"])
        if record["Actual_COD"] is not None:
            record["Error_COD"] = abs(predicted_cod - record["Actual_COD"])
    
    # Append record
    new_record = pd.DataFrame([record])
    if not monitoring.empty:
        monitoring = pd.concat([monitoring, new_record], ignore_index=True)
    else:
        monitoring = new_record
    
    # Save monitoring log
    monitoring.to_csv(MONITORING_FILE, index=False)

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

def run_intelligent_prediction(dataset_filename, num_samples=5, return_structured=False):
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
    df["Date"] = pd.to_datetime(df["Date"], format='%Y-%m-%d')
    df = df.sort_values("Date")
    
    if "Fuel_Consumption" in df.columns:
        df = df.drop(columns=["Fuel_Consumption"])
    
    latest_df = df.groupby("Industry_ID").tail(1).reset_index(drop=True)
    
    if model_type == "Lag-Based":
        latest_df["CO2_Lag_1"] = df.groupby("Industry_ID")["CO2"].shift(1).iloc[-len(latest_df):]
        latest_df["SO2_Lag_1"] = df.groupby("Industry_ID")["SO2"].shift(1).iloc[-len(latest_df):]
        latest_df["BOD_Lag_1"] = df.groupby("Industry_ID")["BOD"].shift(1).iloc[-len(latest_df):]
        latest_df["COD_Lag_1"] = df.groupby("Industry_ID")["COD"].shift(1).iloc[-len(latest_df):]
        latest_df = latest_df.ffill()
    
    latest_df = pd.get_dummies(latest_df, columns=["Industry_Type", "Fuel_Type"], drop_first=True)
    X = align_features(latest_df, feature_columns)
    
    print("\n[5/5] Generating intelligent reports...")
    
    # Prepare structured responses
    structured_responses = []
    
    if not return_structured:
        print("\n" + "="*60)
        print("DETAILED EMISSION INTELLIGENCE REPORT")
        print("="*60)
    
    for i, result in enumerate(forecast_results[:num_samples]):
        if not return_structured:
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
        confidence = compute_confidence(result['OOD_Count'], result['Missing_Ratio'], result['Model_Type'])
        dataset_quality = classify_dataset_quality(confidence)
        regulatory_category = classify_regulatory_category(composite_index)
        
        # Get ranking position
        ranking_position, registry_size = get_registry_ranking(result['Industry_ID'])
        
        # Check for escalation
        escalation = composite_index > 0.8
        escalation_action = "Immediate environmental audit required" if escalation else None
        
        if not return_structured:
            print(f"\nComposite Emission Index: {composite_index:.3f}")
            print(f"Alert Level: {alert_level}")
            print(f"Prediction Confidence: {confidence:.1f}%")
            print(f"Dataset Quality: {dataset_quality}")
            print(f"Regulatory Category: {regulatory_category}")
            if ranking_position:
                print(f"Ranking Position: {ranking_position} of {registry_size}")
        
        # Risk vs Target Analysis
        risk_analysis = compute_risk_vs_target(result)
        
        if not return_structured:
            print(f"\n--- Risk vs Target Analysis ---")
            for pollutant in ["CO2", "SO2", "BOD", "COD"]:
                ra = risk_analysis[pollutant]
                status = " OVER LIMIT" if ra["Over_Limit"] else " Within Limit"
                print(f"\n{pollutant}:")
                print(f"  Predicted: {ra['Predicted']:.2f}")
                print(f"  Limit: {ra['Limit']:.2f}")
                print(f"  Risk: {ra['Risk_Pct']:.1f}% of limit")
                print(f"  Remaining: {ra['Remaining_Allowance']:.2f}")
                print(f"  Status: {status}")
        
        # Severity Ranking
        normalized = {p: result[p] / limits[p] for p in ["CO2", "SO2", "BOD", "COD"]}
        ranked = sorted(normalized.items(), key=lambda x: x[1], reverse=True)
        severity_ranking = [{"pollutant": p, "normalized": float(v), "percentage": float(v*100)} for p, v in ranked]
        
        if not return_structured:
            print(f"\n--- Severity Ranking ---")
            for rank, (pollutant, value) in enumerate(ranked, start=1):
                print(f"{rank}. {pollutant}  {value:.3f} ({value*100:.1f}% of limit)")
            
            plot_severity_ranking(result)
            plot_risk_vs_target(result)
        
        # Root Cause Analysis and Mitigation
        primary_driver = None
        explanation = None
        recommendation_text = None
        mitigation_impact = None
        
        if alert_level in ["Moderate", "Critical"]:
            top_pollutant = ranked[0][0]
            
            if not return_structured:
                print(f"\n--- Root Cause Analysis ({top_pollutant}) ---")
            
            try:
                sample = X.iloc[[i]]
                explanation = explain_prediction(sample, top_pollutant, "lag" if model_type == "Lag-Based" else "cold")
                primary_driver = explanation['primary_driver']
                recommendation_text = get_recommendation(primary_driver)
                
                if not return_structured:
                    print(f"Primary Driver: {primary_driver}")
                    print(f"\nTop Contributing Features:")
                    for feat, val in zip(explanation['top_features'][:3], explanation['contribution_values'][:3]):
                        print(f"   {feat}: +{val:.3f}")
                    print(f"\n--- Recommended Action ---")
                    print(f" {recommendation_text}")
                
                # Project countermeasure impact
                mitigation_impact = project_countermeasure_impact(dataset_filename, result['Industry_ID'], primary_driver)
                
                if mitigation_impact and not return_structured:
                    print(f"\n--- Countermeasure Impact Projection ---")
                    print(f"Countermeasure: {mitigation_impact['countermeasure']}")
                    print(f"Current Index: {mitigation_impact['current_index']:.3f}")
                    print(f"Projected Index: {mitigation_impact['projected_index']:.3f}")
                    print(f"Improvement: {mitigation_impact['improvement_percentage']:.1f}%")
                
            except Exception as e:
                if not return_structured:
                    print(f"SHAP analysis skipped: {str(e)}")
        else:
            recommendation_text = "Emissions within safe limits. Continue monitoring."
            if not return_structured:
                print(f"\n {recommendation_text}")
        
        # Log model monitoring
        log_model_monitoring(
            result['Industry_ID'],
            result['CO2'],
            result['SO2'],
            result['BOD'],
            result['COD']
        )
        
        # Build structured response
        structured_response = {
            "industry_id": result['Industry_ID'],
            "forecast": {
                "predicted_date": result['Predicted_Date'],
                "CO2": float(result['CO2']),
                "SO2": float(result['SO2']),
                "BOD": float(result['BOD']),
                "COD": float(result['COD']),
                "model_type": result['Model_Type']
            },
            "risk_vs_target": risk_analysis,
            "severity_ranking": severity_ranking,
            "composite_index": float(composite_index),
            "alert_level": alert_level,
            "confidence": float(confidence),
            "dataset_quality": dataset_quality,
            "regulatory_category": regulatory_category,
            "ranking_position": ranking_position,
            "registry_size": registry_size,
            "escalation": escalation,
            "escalation_action": escalation_action,
            "recommendation": {
                "primary_driver": primary_driver,
                "action": recommendation_text,
                "explanation": explanation,
                "mitigation_impact": mitigation_impact
            }
        }
        
        structured_responses.append(structured_response)
    
    if not return_structured:
        print(f"\n{'='*60}")
        print("SYSTEM-WIDE SUMMARY")
        print(f"{'='*60}")
        print(f"\nTotal Industries Analyzed: {summary['Total_Industries']}")
        print(f"  Critical: {summary['Critical_Count']}")
        print(f"  Moderate: {summary['Moderate_Count']}")
        print(f"  Low: {summary['Low_Count']}")
        print(f"\nAverage Composite Index: {summary['Average_Composite_Index']:.3f}")
        print(f"Industries Over Limit: {summary['Industries_Over_Limit']}")
        print(f"Registry Size: {summary['Registry_Size']}")
        print(f"\nTop 5 Risky Industries: {top_5_risky}")
        print(f"Safe Industries: {len(safe_industries)} total")
        print(f"\n{'='*60}")
        print(" Analysis complete. Visualizations saved to dataset/")
        print(f"{'='*60}\n")
    
    # Return structured responses if requested
    if return_structured:
        return {
            "predictions": structured_responses,
            "summary": summary,
            "top_5_risky": top_5_risky,
            "safe_industries": safe_industries
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        dataset_file = sys.argv[1]
    else:
        dataset_file = "master_training_dataset.csv"
    run_intelligent_prediction(dataset_file, num_samples=5)
