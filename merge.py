import pandas as pd
import os

# Directory setup
DATA_DIR = "dataset"
os.makedirs(DATA_DIR, exist_ok=True)

# Load raw datasets
production = pd.read_csv(os.path.join(DATA_DIR, "production_operational_data.csv"))
air = pd.read_csv(os.path.join(DATA_DIR, "air_emission_data.csv"))
water = pd.read_csv(os.path.join(DATA_DIR, "liquid_effluent_data.csv"))
weather = pd.read_csv(os.path.join(DATA_DIR, "weather_data.csv"))
compliance = pd.read_csv(os.path.join(DATA_DIR, "compliance_data.csv"))

# Convert Date columns
production["Date"] = pd.to_datetime(production["Date"], dayfirst=True)
air["Date"] = pd.to_datetime(air["Date"], dayfirst=True)
water["Date"] = pd.to_datetime(water["Date"], dayfirst=True)
weather["Date"] = pd.to_datetime(weather["Date"], dayfirst=True)
compliance["Date"] = pd.to_datetime(compliance["Date"], dayfirst=True)

# Merge step-by-step
master = production.merge(air, on=["Industry_ID", "Date"])
master = master.merge(water, on=["Industry_ID", "Date"])
master = master.merge(compliance, on=["Industry_ID", "Date"])
master = master.merge(weather, on="Date")

# Save master dataset
master.to_csv(os.path.join(DATA_DIR, "master_training_dataset.csv"), index=False)

print("Master dataset created")
print("Shape:", master.shape)
