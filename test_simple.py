"""
Simple prediction test without Unicode symbols
"""
import sys
import os

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from predict import run_intelligent_prediction

print("="*60)
print("SIMPLE PREDICTION TEST")
print("="*60)

try:
    print("\n[1/3] Testing prediction pipeline...")
    result = run_intelligent_prediction(
        'master_training_dataset.csv',
        num_samples=2,
        return_structured=True
    )
    
    print("\n[2/3] Checking results...")
    assert 'predictions' in result
    assert 'summary' in result
    assert len(result['predictions']) > 0
    
    print("\n[3/3] Results:")
    print(f"  - Predictions: {len(result['predictions'])}")
    print(f"  - Total Industries: {result['summary']['Total_Industries']}")
    print(f"  - Critical: {result['summary']['Critical_Count']}")
    print(f"  - Moderate: {result['summary']['Moderate_Count']}")
    print(f"  - Low: {result['summary']['Low_Count']}")
    
    print("\n" + "="*60)
    print("SUCCESS: All tests passed!")
    print("="*60)
    sys.exit(0)
    
except Exception as e:
    print(f"\nERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
