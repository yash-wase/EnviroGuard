"""
Test file upload to backend
"""
import requests
import sys

print("Testing file upload to backend...")

url = "http://localhost:8000/api/predict"
file_path = "dataset/master_training_dataset.csv"

try:
    print(f"Uploading: {file_path}")
    with open(file_path, 'rb') as f:
        files = {'dataset': f}
        response = requests.post(url, files=files, timeout=30)
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
    if response.status_code == 200:
        print("\n✅ Upload successful!")
    else:
        print(f"\n❌ Upload failed with status {response.status_code}")
        
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
