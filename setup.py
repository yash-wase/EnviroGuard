"""
EnviroGuard Setup Script
Automates initial system setup and model training
"""
import os
import sys
import subprocess

def check_file_exists(filepath):
    """Check if file exists"""
    return os.path.exists(filepath)

def run_command(command, description):
    """Run a command and print status"""
    print(f"\n{'='*60}")
    print(f"{description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")
        return False

def main():
    print("\n" + "="*60)
    print("ENVIROGUARD SYSTEM SETUP")
    print("="*60)
    
    # Check if models exist
    model_dir = "emission_model"
    lag_model = os.path.join(model_dir, "multi_emission_model.pkl")
    cold_model = os.path.join(model_dir, "multi_emission_cold_model.pkl")
    
    models_exist = check_file_exists(lag_model) and check_file_exists(cold_model)
    
    if models_exist:
        print("\n✅ Models already exist")
        print(f"   - {lag_model}")
        print(f"   - {cold_model}")
        
        response = input("\nDo you want to retrain models? (y/n): ")
        if response.lower() != 'y':
            print("\n✅ Setup complete - models are ready")
            print("\nYou can now start the server:")
            print("  uvicorn app:app --reload")
            return
    else:
        print("\n⚠️  Models not found - training required")
    
    # Check if training dataset exists
    training_dataset = "dataset/master_training_dataset.csv"
    
    if not check_file_exists(training_dataset):
        print(f"\n❌ Training dataset not found: {training_dataset}")
        print("\nPlease ensure the master training dataset exists.")
        print("You can:")
        print("  1. Download it from the project repository")
        print("  2. Generate it using merge.py if you have source data")
        print("  3. Use your own dataset (must match required format)")
        sys.exit(1)
    
    print(f"\n✅ Training dataset found: {training_dataset}")
    
    # Train models
    print("\n" + "="*60)
    print("TRAINING MODELS")
    print("="*60)
    print("\nThis may take a few minutes...")
    
    success = run_command(
        f"python train.py master_training_dataset.csv",
        "Training emission prediction models"
    )
    
    if not success:
        print("\n❌ Model training failed")
        sys.exit(1)
    
    # Verify models were created
    if check_file_exists(lag_model) and check_file_exists(cold_model):
        print("\n✅ Models trained successfully!")
    else:
        print("\n❌ Models were not created properly")
        sys.exit(1)
    
    # Run system verification
    print("\n" + "="*60)
    print("VERIFYING SYSTEM")
    print("="*60)
    
    run_command("python verify_system.py", "Running system checks")
    
    print("\n" + "="*60)
    print("SETUP COMPLETE")
    print("="*60)
    print("\nYour EnviroGuard system is ready!")
    print("\nNext steps:")
    print("  1. Start backend:  uvicorn app:app --reload")
    print("  2. Start frontend: cd frontend && npm run dev")
    print("  3. Open browser:   http://localhost:5173")
    print("\n" + "="*60)

if __name__ == "__main__":
    main()
