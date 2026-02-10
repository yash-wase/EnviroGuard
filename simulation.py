import pandas as pd
import numpy as np
import os
import sys
from forecast import forecast_emissions

# Directory setup
DATA_DIR = "dataset"
MODEL_DIR = "emission_model"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

def run_simulation(dataset_filename, modifications):
    """
    Run what-if scenario simulation
    
    modifications: dict with parameter changes
    Example: {
        "Production_Volume": 1.2,  # 20% increase
        "Treatment_Efficiency": 85,  # Set to 85%
        "Fuel_Type": "Natural Gas"
    }
    """
    
    # Get baseline forecast
    print("\n===== BASELINE FORECAST =====")
    baseline_results, ood_flags, missing_ratio = forecast_emissions(dataset_filename)
    
    # Load dataset for modification
    df = pd.read_csv(os.path.join(DATA_DIR, dataset_filename))
    
    # Apply modifications
    print(f"\n===== APPLYING SCENARIO MODIFICATIONS =====")
    for param, value in modifications.items():
        if param in df.columns:
            if isinstance(value, (int, float)) and value > 0 and value < 10:
                # Treat as multiplier if between 0 and 10
                df[param] = df[param] * value
                print(f"✓ {param}: multiplied by {value}")
            else:
                # Treat as absolute value
                df[param] = value
                print(f"✓ {param}: set to {value}")
        else:
            print(f"⚠ {param} not found in dataset")
    
    # Save modified dataset temporarily
    temp_file = "temp_scenario.csv"
    df.to_csv(os.path.join(DATA_DIR, temp_file), index=False)
    
    # Get scenario forecast
    print(f"\n===== SCENARIO FORECAST =====")
    scenario_results, _, _ = forecast_emissions(temp_file)
    
    # Clean up temp file
    os.remove(os.path.join(DATA_DIR, temp_file))
    
    # Compare results
    comparisons = []
    for baseline, scenario in zip(baseline_results, scenario_results):
        comparison = {
            "Industry_ID": baseline["Industry_ID"],
            "Baseline_CO2": baseline["CO2"],
            "Scenario_CO2": scenario["CO2"],
            "Delta_CO2": scenario["CO2"] - baseline["CO2"],
            "Baseline_SO2": baseline["SO2"],
            "Scenario_SO2": scenario["SO2"],
            "Delta_SO2": scenario["SO2"] - baseline["SO2"],
            "Baseline_BOD": baseline["BOD"],
            "Scenario_BOD": scenario["BOD"],
            "Delta_BOD": scenario["BOD"] - baseline["BOD"],
            "Baseline_COD": baseline["COD"],
            "Scenario_COD": scenario["COD"],
            "Delta_COD": scenario["COD"] - baseline["COD"]
        }
        
        # Compute composite index delta
        limits = {"CO2": 5000, "SO2": 80, "BOD": 250, "COD": 500}
        weights = {"CO2": 0.30, "SO2": 0.25, "BOD": 0.25, "COD": 0.20}
        
        baseline_index = sum(
            weights[p] * (baseline[p] / limits[p]) 
            for p in ["CO2", "SO2", "BOD", "COD"]
        )
        scenario_index = sum(
            weights[p] * (scenario[p] / limits[p]) 
            for p in ["CO2", "SO2", "BOD", "COD"]
        )
        
        comparison["Baseline_Index"] = baseline_index
        comparison["Scenario_Index"] = scenario_index
        comparison["Delta_Index"] = scenario_index - baseline_index
        
        comparisons.append(comparison)
    
    return comparisons

if __name__ == "__main__":
    if len(sys.argv) > 1:
        dataset_file = sys.argv[1]
    else:
        dataset_file = "master_training_dataset.csv"
    
    # Example scenario: 20% production increase + improved treatment
    modifications = {
        "Production_Volume": 1.2,
        "Treatment_Efficiency": 85
    }
    
    comparisons = run_simulation(dataset_file, modifications)
    
    print(f"\n===== SIMULATION COMPARISON =====")
    for i, comp in enumerate(comparisons[:5]):
        print(f"\nIndustry {comp['Industry_ID']}")
        print(f"  CO2: {comp['Baseline_CO2']:.2f} → {comp['Scenario_CO2']:.2f} (Δ {comp['Delta_CO2']:+.2f})")
        print(f"  SO2: {comp['Baseline_SO2']:.2f} → {comp['Scenario_SO2']:.2f} (Δ {comp['Delta_SO2']:+.2f})")
        print(f"  Index: {comp['Baseline_Index']:.3f} → {comp['Scenario_Index']:.3f} (Δ {comp['Delta_Index']:+.3f})")
    
    if len(comparisons) > 5:
        print(f"\n... and {len(comparisons) - 5} more industries")
