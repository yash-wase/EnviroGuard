import pandas as pd
import numpy as np
import os
from datetime import datetime
from forecast import forecast_emissions

# Directory setup
DATA_DIR = "dataset"
MODEL_DIR = "emission_model"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

REGISTRY_FILE = os.path.join(DATA_DIR, "industry_registry.csv")
TREND_FILE = os.path.join(DATA_DIR, "trend_history.csv")

def update_industry_registry(industry_id, composite_index, alert_level, confidence):
    """
    Update or append industry record in registry
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Load or create registry
    if os.path.exists(REGISTRY_FILE):
        registry = pd.read_csv(REGISTRY_FILE)
    else:
        registry = pd.DataFrame(columns=[
            "Industry_ID", "Latest_Composite_Index", "Alert_Level", 
            "Confidence", "Last_Updated"
        ])
    
    # Check if industry exists
    if industry_id in registry["Industry_ID"].values:
        # Update existing record
        registry.loc[registry["Industry_ID"] == industry_id, "Latest_Composite_Index"] = composite_index
        registry.loc[registry["Industry_ID"] == industry_id, "Alert_Level"] = alert_level
        registry.loc[registry["Industry_ID"] == industry_id, "Confidence"] = confidence
        registry.loc[registry["Industry_ID"] == industry_id, "Last_Updated"] = timestamp
    else:
        # Append new record
        new_record = pd.DataFrame([{
            "Industry_ID": industry_id,
            "Latest_Composite_Index": composite_index,
            "Alert_Level": alert_level,
            "Confidence": confidence,
            "Last_Updated": timestamp
        }])
        if not registry.empty:
            registry = pd.concat([registry, new_record], ignore_index=True)
        else:
            registry = new_record
    
    # Save registry
    registry.to_csv(REGISTRY_FILE, index=False)
    
    return registry

def append_trend_history(industry_id, composite_index):
    """
    Append trend record to history
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Load or create trend history
    if os.path.exists(TREND_FILE):
        trend = pd.read_csv(TREND_FILE)
    else:
        trend = pd.DataFrame(columns=["Industry_ID", "Composite_Index", "Date"])
    
    # Append new record
    new_record = pd.DataFrame([{
        "Industry_ID": industry_id,
        "Composite_Index": composite_index,
        "Date": timestamp
    }])
    if not trend.empty:
        trend = pd.concat([trend, new_record], ignore_index=True)
    else:
        trend = new_record
    
    # Save trend history
    trend.to_csv(TREND_FILE, index=False)

def get_registry_ranking(industry_id):
    """
    Get industry ranking position from registry
    Returns: (rank, total_industries)
    """
    if not os.path.exists(REGISTRY_FILE):
        return None, 0
    
    registry = pd.read_csv(REGISTRY_FILE)
    registry = registry.sort_values("Latest_Composite_Index", ascending=False)
    registry["Rank"] = range(1, len(registry) + 1)
    
    industry_rank = registry[registry["Industry_ID"] == industry_id]["Rank"].values
    rank = int(industry_rank[0]) if len(industry_rank) > 0 else None
    
    return rank, len(registry)

def compute_industry_ranking(dataset_filename, new_dataset_filename=None):
    """
    Compute industry ranking based on composite emission index
    
    Combines historical data with new predictions
    Updates registry and trend history
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
    
    # Update registry and trend history for each industry
    for _, row in ranking_df.iterrows():
        # Compute confidence (simplified - use 85% as default)
        confidence = 85.0
        
        # Update registry
        update_industry_registry(
            row["Industry_ID"],
            row["Composite_Index"],
            row["Alert_Level"],
            confidence
        )
        
        # Append trend history
        append_trend_history(row["Industry_ID"], row["Composite_Index"])
    
    # Identify categories
    top_5_risky = ranking_df.head(5)["Industry_ID"].tolist()
    safe_industries = ranking_df[ranking_df["Alert_Level"] == "Low"]["Industry_ID"].tolist()
    
    return ranking_df, top_5_risky, safe_industries

def get_risk_summary(ranking_df):
    """Generate risk summary statistics"""
    
    # Get registry size
    registry_size = 0
    if os.path.exists(REGISTRY_FILE):
        registry = pd.read_csv(REGISTRY_FILE)
        registry_size = len(registry)
    
    summary = {
        "Total_Industries": len(ranking_df),
        "Critical_Count": len(ranking_df[ranking_df["Alert_Level"] == "Critical"]),
        "Moderate_Count": len(ranking_df[ranking_df["Alert_Level"] == "Moderate"]),
        "Low_Count": len(ranking_df[ranking_df["Alert_Level"] == "Low"]),
        "Average_Composite_Index": float(ranking_df["Composite_Index"].mean()),
        "Max_Composite_Index": float(ranking_df["Composite_Index"].max()),
        "Industries_Over_Limit": len(ranking_df[ranking_df["Over_Limit_Count"] > 0]),
        "Registry_Size": registry_size
    }
    
    return summary

def classify_regulatory_category(index):
    """
    Classify regulatory category based on composite index
    
    Returns: Sustainable, Watchlist, Risk, or Critical
    """
    if index < 0.3:
        return "Sustainable"
    elif index < 0.6:
        return "Watchlist"
    elif index < 0.8:
        return "Risk"
    else:
        return "Critical"

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
