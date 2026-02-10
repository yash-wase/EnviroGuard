import pandas as pd
import numpy as np
import joblib
import os
import sys

print('EnviroGuard System Starting...')

from forecast import forecast_emissions
from ranking import compute_industry_ranking, get_risk_summary

DATA_DIR = 'dataset'
MODEL_DIR = 'emission_model'

if __name__ == '__main__':
    dataset_file = 'master_training_dataset.csv'
    print(f'Loading {dataset_file}...')
    results, ood, missing = forecast_emissions(dataset_file)
    print(f'Forecast complete: {len(results)} industries')
    
    ranking_df, top_5, safe = compute_industry_ranking(dataset_file)
    print(f'Top 5 risky: {top_5}')
