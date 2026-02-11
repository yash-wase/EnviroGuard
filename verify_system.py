"""
EnviroGuard System Verification Script
Checks if all components are properly configured and ready
"""
import os
import sys

def check_file(path, description):
    """Check if a file exists"""
    exists = os.path.exists(path)
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {path}")
    return exists

def check_directory(path, description):
    """Check if a directory exists"""
    exists = os.path.isdir(path)
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {path}")
    return exists

def check_import(module_name):
    """Check if a Python module can be imported"""
    try:
        __import__(module_name)
        print(f"✅ {module_name} installed")
        return True
    except ImportError:
        print(f"❌ {module_name} NOT installed")
        return False

def main():
    print("=" * 60)
    print("EnviroGuard System Verification")
    print("=" * 60)
    print()
    
    all_checks = []
    
    # Backend Files
    print("📦 Backend Files:")
    all_checks.append(check_file("app.py", "FastAPI server"))
    all_checks.append(check_file("config.py", "Configuration"))
    all_checks.append(check_file("schemas.py", "Pydantic schemas"))
    all_checks.append(check_file("requirements.txt", "Dependencies"))
    print()
    
    # Intelligence Modules
    print("🧠 Intelligence Modules:")
    all_checks.append(check_file("predict.py", "Prediction pipeline"))
    all_checks.append(check_file("forecast.py", "Forecasting"))
    all_checks.append(check_file("ranking.py", "Ranking"))
    all_checks.append(check_file("simulation.py", "Simulation"))
    all_checks.append(check_file("explain.py", "SHAP explanations"))
    all_checks.append(check_file("mitigation.py", "Mitigation"))
    all_checks.append(check_file("visualization.py", "Visualization"))
    all_checks.append(check_file("validator.py", "Validation"))
    print()
    
    # Utility Modules
    print("🔧 Utility Modules:")
    all_checks.append(check_directory("utils", "Utils directory"))
    all_checks.append(check_file("utils/file_handler.py", "File handler"))
    all_checks.append(check_file("utils/response_formatter.py", "Response formatter"))
    all_checks.append(check_file("utils/logger.py", "Logger"))
    print()
    
    # Data & Models
    print("📊 Data & Models:")
    all_checks.append(check_directory("dataset", "Dataset directory"))
    all_checks.append(check_directory("emission_model", "Model directory"))
    all_checks.append(check_file("emission_model/multi_emission_model.pkl", "Lag-based model"))
    all_checks.append(check_file("emission_model/multi_emission_cold_model.pkl", "Cold-start model"))
    all_checks.append(check_file("emission_model/feature_columns.pkl", "Feature columns"))
    all_checks.append(check_file("emission_model/training_stats.pkl", "Training stats"))
    print()
    
    # Frontend Files
    print("🎨 Frontend Files:")
    all_checks.append(check_directory("frontend", "Frontend directory"))
    all_checks.append(check_file("frontend/package.json", "Package config"))
    all_checks.append(check_file("frontend/vite.config.js", "Vite config"))
    all_checks.append(check_file("frontend/tailwind.config.js", "Tailwind config"))
    all_checks.append(check_file("frontend/src/App.jsx", "Main app"))
    all_checks.append(check_file("frontend/src/api/apiClient.js", "API client"))
    all_checks.append(check_directory("frontend/node_modules", "Node modules"))
    print()
    
    # Frontend Pages
    print("📱 Frontend Pages:")
    all_checks.append(check_file("frontend/src/pages/Landing.jsx", "Landing page"))
    all_checks.append(check_file("frontend/src/pages/Upload.jsx", "Upload page"))
    all_checks.append(check_file("frontend/src/pages/Dashboard.jsx", "Dashboard"))
    all_checks.append(check_file("frontend/src/pages/CounterMeasures.jsx", "Counter Measures"))
    all_checks.append(check_file("frontend/src/pages/Ranking.jsx", "Ranking"))
    all_checks.append(check_file("frontend/src/pages/Guidelines.jsx", "Guidelines"))
    print()
    
    # Python Dependencies
    print("🐍 Python Dependencies:")
    all_checks.append(check_import("pandas"))
    all_checks.append(check_import("numpy"))
    all_checks.append(check_import("xgboost"))
    all_checks.append(check_import("sklearn"))
    all_checks.append(check_import("matplotlib"))
    all_checks.append(check_import("shap"))
    all_checks.append(check_import("joblib"))
    all_checks.append(check_import("fastapi"))
    all_checks.append(check_import("uvicorn"))
    print()
    
    # Documentation
    print("📚 Documentation:")
    all_checks.append(check_file("BACKEND_README.md", "Backend docs"))
    all_checks.append(check_file("FRONTEND_SETUP.md", "Frontend setup"))
    all_checks.append(check_file("FULLSTACK_DEPLOYMENT.md", "Deployment guide"))
    all_checks.append(check_file("SYSTEM_STATUS.md", "System status"))
    print()
    
    # Summary
    print("=" * 60)
    passed = sum(all_checks)
    total = len(all_checks)
    percentage = (passed / total) * 100
    
    print(f"Results: {passed}/{total} checks passed ({percentage:.1f}%)")
    
    if passed == total:
        print("✅ System is FULLY OPERATIONAL!")
        print()
        print("🚀 Quick Start:")
        print("   Backend:  uvicorn app:app --reload")
        print("   Frontend: cd frontend && npm run dev")
        return 0
    else:
        print("⚠️  Some components are missing or not configured")
        print("   Please review the failed checks above")
        return 1

if __name__ == "__main__":
    sys.exit(main())
