"""
What-If Scenario Simulation Module
Allows testing operational changes before implementation
"""
import pandas as pd
import numpy as np
import joblib
import os
from forecast import forecast_emissions
from validator import align_features

DATA_DIR = "dataset"
MODEL_DIR = "emission_model"

def run_simulation(dataset_filename, modifications):
    """
    Run what-if scenario simulation
    
    Args:
        dataset_filename: CSV file to simulate on
        modifications: Dictionary of feature changes
            Example: {
                "Production_Volume": 1.1,  # 10% increase
                "Treatment_Efficiency": 85  # Set to 85%
            }
    
    Returns:
        List of comparison dictionaries with baseline vs scenario
    """
    print("\n" + "="*60)
    print("WHAT-IF SCENARIO SIMULATION")
    print("="*60)
    
    # Load dataset
    df = pd.read_csv(os.path.join(DATA_DIR, dataset_filename))
    df["Date"] = pd.to_datetime(df["Date"], format='%Y-%m-%d', errors='coerce')
    
    # Get baseline predictions
    print("\n[1/3] Computing baseline predictions...")
    baseline_results, _, _ = forecast_emissions(dataset_filename)
    
    # Create modified dataset
    print("\n[2/3] Applying modifications...")
    df_modified = df.copy()
    
    for feature, value in modifications.items():
        if feature in df_modified.columns:
            if isinstance(value, float) and value > 0 and value < 10:
                # Treat as multiplier if between 0 and 10
                df_modified[feature] = df_modified[feature] * value
                print(f"  - {feature}: multiplied by {value}")
            else:
                # Treat as absolute value
                df_modified[feature] = value
                print(f"  - {feature}: set to {value}")
        else:
            print(f"  Warning: {feature} not found in dataset")
    
    # Save modified dataset temporarily
    temp_filename = "temp_simulation.csv"
    temp_path = os.path.join(DATA_DIR, temp_filename)
    df_modified.to_csv(temp_path, index=False)
    
    # Get scenario predictions
    print("\n[3/3] Computing scenario predictions...")
    scenario_results, _, _ = forecast_emissions(temp_filename)
    
    # Clean up temp file
    if os.path.exists(temp_path):
        os.remove(temp_path)
    
    # Compare results
    print("\n" + "="*60)
    print("SIMULATION RESULTS")
    print("="*60)
    
    comparisons = []
    limits = {"CO2": 5000, "SO2": 80, "BOD": 250, "COD": 500}
    weights = {"CO2": 0.30, "SO2": 0.25, "BOD": 0.25, "COD": 0.20}
    
    for baseline, scenario in zip(baseline_results, scenario_results):
        # Calculate composite indices
        baseline_index = sum(
            weights[p] * (baseline[p] / limits[p]) 
            for p in ["CO2", "SO2", "BOD", "COD"]
        )
        
        scenario_index = sum(
            weights[p] * (scenario[p] / limits[p]) 
            for p in ["CO2", "SO2", "BOD", "COD"]
        )
        
        delta_index = scenario_index - baseline_index
        improvement_pct = (delta_index / baseline_index * 100) if baseline_index > 0 else 0
        
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
            "Delta_COD": scenario["COD"] - baseline["COD"],
            "Baseline_Index": baseline_index,
            "Scenario_Index": scenario_index,
            "Delta_Index": delta_index,
            "Improvement_Pct": improvement_pct
        }
        
        comparisons.append(comparison)
        
        print(f"\nIndustry: {baseline['Industry_ID']}")
        print(f"  Baseline Index: {baseline_index:.3f}")
        print(f"  Scenario Index: {scenario_index:.3f}")
        print(f"  Change: {delta_index:+.3f} ({improvement_pct:+.1f}%)")
        
        if delta_index < 0:
            print(f"  Result: IMPROVEMENT (Lower emissions)")
        elif delta_index > 0:
            print(f"  Result: INCREASE (Higher emissions)")
        else:
            print(f"  Result: NO CHANGE")
    
    print("\n" + "="*60)
    print(f"Simulation complete for {len(comparisons)} industries")
    print("="*60)
    
    return comparisons

def simulate_countermeasure(dataset_filename, industry_id, countermeasure_type):
    """
    Simulate specific countermeasure impact
    
    Args:
        dataset_filename: CSV file
        industry_id: Target industry
        countermeasure_type: Type of countermeasure
            - "treatment_upgrade": Increase treatment efficiency by 10%
            - "production_reduce": Reduce production by 15%
            - "equipment_optimize": Reduce operating hours by 10%
    
    Returns:
        Comparison dictionary
    """
    modifications = {}
    
    if countermeasure_type == "treatment_upgrade":
        modifications = {"Treatment_Efficiency": 1.1}  # 10% increase
    elif countermeasure_type == "production_reduce":
        modifications = {"Production_Volume": 0.85}  # 15% reduction
    elif countermeasure_type == "equipment_optimize":
        modifications = {"Operating_Hours": 0.9}  # 10% reduction
    else:
        raise ValueError(f"Unknown countermeasure type: {countermeasure_type}")
    
    comparisons = run_simulation(dataset_filename, modifications)
    
    # Find the specific industry
    for comp in comparisons:
        if comp["Industry_ID"] == industry_id:
            return comp
    
    return None

if __name__ == "__main__":
    # Test simulation
    print("Simulation module loaded successfully")
    
    # Example modifications
    test_modifications = {
        "Production_Volume": 1.1,  # 10% increase
        "Treatment_Efficiency": 85  # Set to 85%
    }
    
    print(f"\nTest modifications: {test_modifications}")
    print("Ready to run simulations")
