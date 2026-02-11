# 🚀 EnviroGuard Setup Guide

## Quick Setup (Recommended)

### 1. Install Dependencies
```bash
# Backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
cd ..
```

### 2. Run Setup Script
```bash
python setup.py
```

This will:
- Check if models exist
- Train models if needed (using master_training_dataset.csv)
- Verify system is ready

### 3. Start Servers
```bash
# Terminal 1 - Backend
uvicorn app:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Manual Setup

### If Models Are Missing

The system requires trained ML models to function. If you see errors about missing models:

```bash
# Train models using the master dataset
python train.py master_training_dataset.csv
```

This creates:
- `emission_model/multi_emission_model.pkl` (Lag-based model)
- `emission_model/multi_emission_cold_model.pkl` (Cold-start model)
- `emission_model/feature_columns.pkl` (Feature definitions)
- `emission_model/training_stats.pkl` (Training statistics)

### If Training Dataset Is Missing

The `master_training_dataset.csv` file is too large for GitHub (163MB). You have options:

**Option 1: Use Sample Data**
```bash
# Use the small sample for testing
python train.py uploads/infratech_small.csv
```

**Option 2: Generate Full Dataset**
If you have the source data files, merge them:
```bash
python merge.py
```

**Option 3: Use Your Own Data**
Ensure your CSV has these columns:
- Industry_ID
- Date
- Production_Volume
- Fuel_Type
- Operating_Hours
- Equipment_Age
- Capacity_Utilization
- Treatment_Efficiency
- Industry_Type
- CO2, SO2, BOD, COD (for training)

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'explain'"
**Solution**: The explain.py and simulation.py modules are now included. Pull latest code:
```bash
git pull origin production-refactor
```

### "Models not found" Error
**Solution**: Run the setup script or train manually:
```bash
python setup.py
# OR
python train.py master_training_dataset.csv
```

### "Cannot connect to server"
**Solution**: Ensure backend is running:
```bash
uvicorn app:app --reload
```

### Upload Not Working
**Checklist**:
1. ✅ Backend server running (http://localhost:8000)
2. ✅ Models trained (check emission_model/ folder)
3. ✅ Frontend running (http://localhost:5173)
4. ✅ File is CSV format
5. ✅ File size < 200MB

---

## System Requirements

### Backend
- Python 3.8+
- 2GB RAM minimum
- 500MB disk space

### Frontend
- Node.js 18+
- Modern web browser

---

## First Time Setup Checklist

- [ ] Clone repository
- [ ] Install Python dependencies (`pip install -r requirements.txt`)
- [ ] Install Node dependencies (`cd frontend && npm install`)
- [ ] Run setup script (`python setup.py`)
- [ ] Start backend server (`uvicorn app:app --reload`)
- [ ] Start frontend server (`cd frontend && npm run dev`)
- [ ] Test upload with sample file
- [ ] Verify predictions work

---

## Production Deployment

### Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Train models
python train.py master_training_dataset.csv

# Start with Gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
# Install dependencies
cd frontend
npm install

# Build for production
npm run build

# Deploy dist/ folder to hosting service
```

---

## Support

If you encounter issues:

1. Check this guide first
2. Run `python verify_system.py` to diagnose
3. Check server logs for errors
4. Ensure all dependencies are installed

---

**Version**: 1.0.0  
**Last Updated**: February 12, 2026

© 2024 EnviroGuard
