import pandas as pd
import numpy as np
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import r2_score, mean_absolute_error
from xgboost import XGBRegressor
import joblib
import os
import sys

# Directory setup
DATA_DIR = "dataset"
MODEL_DIR = "emission_model"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

def train_models(dataset_filename):
    """Train both lag-based and cold-start multi-output emission models"""
    
    # Load dataset
    df = pd.read_csv(os.path.join(DATA_DIR, dataset_filename))
    df["Date"] = pd.to_datetime(df["Date"], format='%Y-%m-%d')
    df = df.sort_values("Date")
    
    # Remove leakage features
    if "Fuel_Consumption" in df.columns:
        df = df.drop(columns=["Fuel_Consumption"])
    
    # Store training statistics for OOD detection
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    training_stats = {}
    for col in numeric_cols:
        training_stats[col] = {
            "min": float(df[col].min()),
            "max": float(df[col].max()),
            "mean": float(df[col].mean()),
            "std": float(df[col].std())
        }
    
    # ===== MODEL 1: LAG-BASED MODEL =====
    df_lag = df.copy()
    
    # Add lag features
    df_lag["CO2_Lag_1"] = df_lag.groupby("Industry_ID")["CO2"].shift(1)
    df_lag["SO2_Lag_1"] = df_lag.groupby("Industry_ID")["SO2"].shift(1)
    df_lag["BOD_Lag_1"] = df_lag.groupby("Industry_ID")["BOD"].shift(1)
    df_lag["COD_Lag_1"] = df_lag.groupby("Industry_ID")["COD"].shift(1)
    
    df_lag = df_lag.dropna()
    
    # Encode categorical
    df_lag = pd.get_dummies(df_lag, columns=["Industry_Type", "Fuel_Type"], drop_first=True)
    
    # Time split
    train = df_lag[df_lag["Date"] < "2023-01-01"]
    test = df_lag[df_lag["Date"] >= "2023-01-01"]
    
    X_train = train.drop(columns=["CO2", "SO2", "BOD", "COD", "TSS", "pH", "Date"])
    X_test = test.drop(columns=["CO2", "SO2", "BOD", "COD", "TSS", "pH", "Date"])
    
    y_train = train[["CO2", "SO2", "BOD", "COD"]]
    y_test = test[["CO2", "SO2", "BOD", "COD"]]
    
    # Train lag-based model
    base_model = XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.1,
        random_state=42
    )
    
    lag_model = MultiOutputRegressor(base_model)
    lag_model.fit(X_train, y_train)
    
    # Evaluate
    preds = lag_model.predict(X_test)
    
    print("\n===== LAG-BASED MODEL PERFORMANCE =====")
    for i, col in enumerate(["CO2", "SO2", "BOD", "COD"]):
        r2 = r2_score(y_test[col], preds[:, i])
        mae = mean_absolute_error(y_test[col], preds[:, i])
        print(f"{col} - R2: {r2:.4f}, MAE: {mae:.2f}")
    
    # Save lag model and features
    joblib.dump(lag_model, os.path.join(MODEL_DIR, "multi_emission_model.pkl"))
    joblib.dump(X_train.columns.tolist(), os.path.join(MODEL_DIR, "feature_columns.pkl"))
    
    # ===== MODEL 2: COLD-START MODEL (NO LAG FEATURES) =====
    df_cold = df.copy()
    
    # Encode categorical
    df_cold = pd.get_dummies(df_cold, columns=["Industry_Type", "Fuel_Type"], drop_first=True)
    
    # Time split
    train_cold = df_cold[df_cold["Date"] < "2023-01-01"]
    test_cold = df_cold[df_cold["Date"] >= "2023-01-01"]
    
    X_train_cold = train_cold.drop(columns=["CO2", "SO2", "BOD", "COD", "TSS", "pH", "Date"])
    X_test_cold = test_cold.drop(columns=["CO2", "SO2", "BOD", "COD", "TSS", "pH", "Date"])
    
    y_train_cold = train_cold[["CO2", "SO2", "BOD", "COD"]]
    y_test_cold = test_cold[["CO2", "SO2", "BOD", "COD"]]
    
    # Train cold-start model
    cold_model = MultiOutputRegressor(base_model)
    cold_model.fit(X_train_cold, y_train_cold)
    
    # Evaluate
    preds_cold = cold_model.predict(X_test_cold)
    
    print("\n===== COLD-START MODEL PERFORMANCE =====")
    for i, col in enumerate(["CO2", "SO2", "BOD", "COD"]):
        r2 = r2_score(y_test_cold[col], preds_cold[:, i])
        mae = mean_absolute_error(y_test_cold[col], preds_cold[:, i])
        print(f"{col} - R2: {r2:.4f}, MAE: {mae:.2f}")
    
    # Save cold-start model
    joblib.dump(cold_model, os.path.join(MODEL_DIR, "multi_emission_cold_model.pkl"))
    
    # Save training stats
    joblib.dump(training_stats, os.path.join(MODEL_DIR, "training_stats.pkl"))
    
    print(f"\n✓ Models saved to {MODEL_DIR}/")
    print(f"✓ Training stats saved")
    print(f"✓ Feature columns saved")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        dataset_file = sys.argv[1]
    else:
        dataset_file = "master_training_dataset.csv"
    
    train_models(dataset_file)
