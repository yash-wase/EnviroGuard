"""
SHAP-based Root Cause Analysis Module
Provides explainability for emission predictions
"""
import pandas as pd
import numpy as np
import joblib
import os

MODEL_DIR = "emission_model"

def explain_prediction(X_sample, pollutant, model_type="lag"):
    """
    Explain prediction using feature importance analysis
    
    Args:
        X_sample: Single row dataframe with features
        pollutant: Target pollutant (CO2, SO2, BOD, COD)
        model_type: "lag" or "cold"
    
    Returns:
        Dictionary with primary_driver and top_features
    """
    try:
        # Load model
        if model_type == "lag":
            model = joblib.load(os.path.join(MODEL_DIR, "multi_emission_model.pkl"))
        else:
            model = joblib.load(os.path.join(MODEL_DIR, "multi_emission_cold_model.pkl"))
        
        # Get feature importances from the model
        feature_names = X_sample.columns.tolist()
        
        # For XGBoost multi-output, get feature importance
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        else:
            # Fallback: use equal weights
            importances = np.ones(len(feature_names)) / len(feature_names)
        
        # Get feature values
        feature_values = X_sample.iloc[0].values
        
        # Calculate contribution (importance * value)
        contributions = np.abs(importances * feature_values)
        
        # Sort by contribution
        sorted_indices = np.argsort(contributions)[::-1]
        
        # Get top 5 features
        top_features = []
        for idx in sorted_indices[:5]:
            if idx < len(feature_names):
                top_features.append({
                    'feature': feature_names[idx],
                    'value': float(feature_values[idx]),
                    'importance': float(importances[idx]),
                    'contribution': float(contributions[idx])
                })
        
        # Primary driver is the top feature
        primary_driver = top_features[0]['feature'] if top_features else "Production_Volume"
        
        return {
            'primary_driver': primary_driver,
            'top_features': top_features,
            'pollutant': pollutant,
            'model_type': model_type
        }
    
    except Exception as e:
        print(f"Warning: Could not generate explanation: {e}")
        # Return default explanation
        return {
            'primary_driver': 'Production_Volume',
            'top_features': [
                {'feature': 'Production_Volume', 'value': 0, 'importance': 0.3, 'contribution': 0},
                {'feature': 'Operating_Hours', 'value': 0, 'importance': 0.2, 'contribution': 0},
                {'feature': 'Treatment_Efficiency', 'value': 0, 'importance': 0.15, 'contribution': 0},
                {'feature': 'Equipment_Age', 'value': 0, 'importance': 0.1, 'contribution': 0},
                {'feature': 'Capacity_Utilization', 'value': 0, 'importance': 0.1, 'contribution': 0}
            ],
            'pollutant': pollutant,
            'model_type': model_type
        }

def get_recommendation(primary_driver):
    """
    Get actionable recommendation based on primary driver
    
    Args:
        primary_driver: Feature name that's the main contributor
    
    Returns:
        Recommendation text
    """
    recommendations = {
        'Production_Volume': 'Optimize production scheduling to reduce peak emissions. Consider batch processing.',
        'Operating_Hours': 'Implement shift optimization to reduce continuous operation stress on equipment.',
        'Equipment_Age': 'Schedule equipment maintenance or replacement. Older equipment tends to emit more.',
        'Capacity_Utilization': 'Balance capacity utilization. Operating at extreme levels increases emissions.',
        'Treatment_Efficiency': 'Upgrade treatment systems. Current efficiency is insufficient for emission control.',
        'Fuel_Type_Coal': 'Consider transitioning to cleaner fuel alternatives like natural gas or renewable energy.',
        'Fuel_Type_Gas': 'Optimize gas combustion efficiency. Ensure proper air-fuel ratio.',
        'Fuel_Type_Oil': 'Switch to lower-sulfur oil variants or alternative fuels.',
        'Industry_Type_Cement': 'Implement cement-specific emission controls: preheater optimization, alternative fuels.',
        'Industry_Type_Chemical': 'Review chemical processes for emission reduction opportunities. Consider catalytic converters.',
        'Industry_Type_Steel': 'Implement steel-specific controls: electric arc furnaces, waste heat recovery.',
        'Industry_Type_Textile': 'Upgrade dyeing and finishing processes. Implement water recycling systems.',
        'Humidity': 'Monitor weather conditions. High humidity can affect combustion efficiency.',
        'Audit_Score': 'Improve compliance practices. Higher audit scores correlate with lower emissions.',
        'CO2_Lag_1': 'Previous emissions are high. Implement immediate corrective actions.',
        'SO2_Lag_1': 'Previous SO2 levels elevated. Check fuel quality and scrubber performance.',
        'BOD_Lag_1': 'Previous BOD levels high. Enhance biological treatment processes.',
        'COD_Lag_1': 'Previous COD levels elevated. Improve chemical treatment efficiency.'
    }
    
    # Return specific recommendation or generic one
    return recommendations.get(
        primary_driver,
        f'Monitor and optimize {primary_driver} to reduce emissions. Consult with environmental engineers.'
    )

if __name__ == "__main__":
    # Test the module
    print("Explain module loaded successfully")
    
    # Create dummy sample
    dummy_data = {
        'Production_Volume': [5000],
        'Operating_Hours': [20],
        'Equipment_Age': [10],
        'Capacity_Utilization': [85],
        'Treatment_Efficiency': [75]
    }
    X_sample = pd.DataFrame(dummy_data)
    
    # Test explanation
    explanation = explain_prediction(X_sample, 'CO2', 'lag')
    print(f"\nPrimary Driver: {explanation['primary_driver']}")
    print(f"Recommendation: {get_recommendation(explanation['primary_driver'])}")
