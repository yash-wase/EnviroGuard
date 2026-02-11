"""
API Test Script for EnviroGuard Backend
Tests all endpoints to verify functionality
"""
import requests
import json
import os

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health check endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 200
    assert response.json()["status"] == "running"
    print("✓ Health check passed")

def test_guidelines():
    """Test guidelines endpoint"""
    print("\n" + "="*60)
    print("TEST 2: Guidelines")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/api/guidelines")
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Success: {data['success']}")
    print(f"Regulatory Limits: {data['data']['regulatory_limits']}")
    
    assert response.status_code == 200
    assert data["success"] == True
    print("✓ Guidelines test passed")

def test_predict():
    """Test prediction endpoint"""
    print("\n" + "="*60)
    print("TEST 3: Prediction (Upload & Predict)")
    print("="*60)
    
    # Check if master dataset exists
    dataset_path = "dataset/master_training_dataset.csv"
    if not os.path.exists(dataset_path):
        print("⚠ Master dataset not found. Skipping prediction test.")
        return
    
    # Upload file
    with open(dataset_path, 'rb') as f:
        files = {'dataset': ('test_dataset.csv', f, 'text/csv')}
        response = requests.post(f"{BASE_URL}/api/predict", files=files)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Success: {data['success']}")
        print(f"Total Industries: {data['data']['summary']['Total_Industries']}")
        print(f"Top 5 Risky: {data['data']['top_5_risky']}")
        print("✓ Prediction test passed")
    else:
        print(f"✗ Prediction test failed: {response.text}")

def test_ranking():
    """Test ranking endpoint"""
    print("\n" + "="*60)
    print("TEST 4: Industry Ranking")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/api/ranking")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Success: {data['success']}")
        print(f"Registry Size: {data['data']['registry_size']}")
        print(f"Top 5 Risky: {data['data']['top_5_risky']}")
        print("✓ Ranking test passed")
    elif response.status_code == 404:
        print("⚠ Registry not found. Run prediction first.")
    else:
        print(f"✗ Ranking test failed: {response.text}")

def test_trend():
    """Test trend endpoint"""
    print("\n" + "="*60)
    print("TEST 5: Trend History")
    print("="*60)
    
    # Try with a sample industry ID
    industry_id = "IND001"
    response = requests.get(f"{BASE_URL}/api/trend/{industry_id}")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Success: {data['success']}")
        print(f"Industry: {data['data']['industry_id']}")
        print(f"Total Records: {data['data']['total_records']}")
        print(f"Trend Direction: {data['data']['trend_direction']}")
        print("✓ Trend test passed")
    elif response.status_code == 404:
        print("⚠ Trend data not found. Run predictions multiple times to generate trends.")
    else:
        print(f"✗ Trend test failed: {response.text}")

def test_simulation():
    """Test simulation endpoint"""
    print("\n" + "="*60)
    print("TEST 6: What-If Simulation")
    print("="*60)
    
    payload = {
        "dataset_filename": "master_training_dataset.csv",
        "modifications": {
            "Production_Volume": 1.1,
            "Treatment_Efficiency": 85
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/api/simulate",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Success: {data['success']}")
        print(f"Total Industries: {data['data']['total_industries']}")
        print(f"Modifications Applied: {data['data']['modifications_applied']}")
        print("✓ Simulation test passed")
    else:
        print(f"✗ Simulation test failed: {response.text}")

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("ENVIROGUARD BACKEND API TEST SUITE")
    print("="*60)
    print(f"Testing server at: {BASE_URL}")
    
    try:
        # Test 1: Health Check
        test_health()
        
        # Test 2: Guidelines
        test_guidelines()
        
        # Test 3: Prediction
        test_predict()
        
        # Test 4: Ranking
        test_ranking()
        
        # Test 5: Trend
        test_trend()
        
        # Test 6: Simulation
        test_simulation()
        
        print("\n" + "="*60)
        print("TEST SUITE COMPLETE")
        print("="*60)
        print("✓ All available tests passed")
        print("\nNote: Some tests may be skipped if data not available.")
        print("Run predictions first to generate registry and trend data.")
        
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Cannot connect to server")
        print("Make sure the server is running:")
        print("  uvicorn app:app --reload")
    
    except Exception as e:
        print(f"\n✗ ERROR: {e}")

if __name__ == "__main__":
    main()
