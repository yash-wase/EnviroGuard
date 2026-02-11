"""
Quick prediction test
"""
from predict import run_intelligent_prediction

print("Testing prediction pipeline...")
result = run_intelligent_prediction(
    'master_training_dataset.csv',
    num_samples=2,
    return_structured=True
)

print(f"✅ Prediction test passed!")
print(f"   Found {len(result['predictions'])} predictions")
print(f"   Summary: {result['summary']['Total_Industries']} industries")
print(f"   Critical: {result['summary']['Critical_Count']}")
print(f"   Moderate: {result['summary']['Moderate_Count']}")
print(f"   Low: {result['summary']['Low_Count']}")
