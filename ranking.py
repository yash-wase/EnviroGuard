import pandas as pd
import numpy as np
import os
from forecast import forecast_emissions

# Directory setup
DATA_DIR = "dataset"
MODEL_DIR = "emission_model"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

def compute_industry_ranking(dataset_filename, new_dataset_filename=None):
    """
    Compute industry ranking based on composite emission index
    
    Combines historical data with new predictions
    Returns ranked dataframe with risk metrics
    """
    
    # Get forecast results
    forecast_results, _, _ = forecast_emissions(dataset_filename)
    
    # Regulatory limits and weights
    limits = {"CO2": 5000, "SO2": 80, "BOD": 250, "COD": 500}
    weights = {"CO2": 0.30, "SO2": 0.25, "BOD": 0.25, "COD": 0.20}
    
    # Compute metrics for each industry
    ranking_data = []
    
    for result in forecast_results:
        # Composite index
        composite_index = sum(
            weights[p] * (result[p] / limits[p]) 
            for p in ["CO2", "SO2", "BOD", "COD"]
        )
        
        # Average emission risk (% of limit)
        avg_risk = np.mean([
            (result[p] / limits[p]) * 100 
            for p in ["CO2", "SO2", "BOD", "COD"]
        ])
        
        # Max emission risk
        max_risk = max([
            (result[p] / limits[p]) * 100 
            for p in ["CO2", "SO2", "BOD", "COD"]
        ])
        
        # Alert level
        if composite_index < 0.4:
            alert_level = "Low"
        elif composite_index < 0.7:
            alert_level = "Moderate"
        else:
            alert_level = "Critical"
        
        # Over-limit count
        over_limit_count = sum([
            1 for p in ["CO2", "SO2", "BOD", "COD"] 
            if result[p] > limits[p]
        ])
        
        ranking_data.append({
            "Industry_ID": result["Industry_ID"],
            "Composite_Index": composite_index,
            "Average_Risk_Pct": avg_risk,
            "Max_Risk_Pct": max_risk,
            "Alert_Level": alert_level,
            "Over_Limit_Count": over_limit_count,
            "CO2": result["CO2"],
            "SO2": result["SO2"],
            "BOD": result["BOD"],
            "COD": result["COD"],
            "Predicted_Date": result["Predicted_Date"]
        })
    
    # Create dataframe and rank
    ranking_df = pd.DataFrame(ranking_data)
    ranking_df = ranking_df.sort_values("Composite_Index", ascending=False)
    ranking_df["Rank"] = range(1, len(ranking_df) + 1)
    
    # Identify categories
    top_5_risky = ranking_df.head(5)["Industry_ID"].tolist()
    safe_industries = ranking_df[ranking_df["Alert_Level"] == "Low"]["Industry_ID"].tolist()
    
    return ranking_df, top_5_risky, safe_industries

def get_risk_summary(ranking_df):
    """Generate risk summary statistics"""
    
    summary = {
        "Total_Industries": len(ranking_df),
        "Critical_Count": len(ranking_df[ranking_df["Alert_Level"] == "Critical"]),
        "Moderate_Count": len(ranking_df[ranking_df["Alert_Level"] == "Moderate"]),
        "Low_Count": len(ranking_df[ranking_df["Alert_Level"] == "Low"]),
        "Average_Composite_Index": float(ranking_df["Composite_Index"].mean()),
        "Max_Composite_Index": float(ranking_df["Composite_Index"].max()),
        "Industries_Over_Limit": len(ranking_df[ranking_df["Over_Limit_Count"] > 0])
    }
    
    return summary

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        dataset_file = sys.argv[1]
    else:
        dataset_file = "master_training_dataset.csv"
    
    ranking_df, top_5_risky, safe_industries = compute_industry_ranking(dataset_file)
    summary = get_risk_summary(ranking_df)
    
    print("\n===== INDUSTRY RANKING =====")
    print(f"\nTotal Industries: {summary['Total_Industries']}")
    print(f"Critical: {summary['Critical_Count']}")
    print(f"Moderate: {summary['Moderate_Count']}")
    print(f"Low: {summary['Low_Count']}")
    print(f"Average Composite Index: {summary['Average_Composite_Index']:.3f}")
    
    print(f"\n===== TOP 5 RISKY INDUSTRIES =====")
    for i, row in ranking_df.head(5).iterrows():
        print(f"\nRank {row['Rank']}: Industry {row['Industry_ID']}")
        print(f"  Composite Index: {row['Composite_Index']:.3f}")
        print(f"  Alert Level: {row['Alert_Level']}")
        print(f"  Average Risk: {row['Average_Risk_Pct']:.1f}%")
    
    print(f"\n===== SAFE INDUSTRIES =====")
    print(f"Total: {len(safe_industries)}")
    if len(safe_industries) > 0:
        print(f"IDs: {safe_industries[:10]}")
        if len(safe_industries) > 10:
            print(f"... and {len(safe_industries) - 10} more")
