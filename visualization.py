import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os
from datetime import datetime

# Directory setup
DATA_DIR = "dataset"
MODEL_DIR = "emission_model"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

TREND_FILE = os.path.join(DATA_DIR, "trend_history.csv")

def plot_historical_vs_forecast(historical_df, forecast_results, industry_id, save=True):
    """Plot historical emissions vs forecast for a specific industry"""
    
    # Filter historical data for industry
    hist = historical_df[historical_df["Industry_ID"] == industry_id].copy()
    hist = hist.sort_values("Date")
    
    # Get forecast for industry
    forecast = [r for r in forecast_results if r["Industry_ID"] == industry_id][0]
    
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    fig.suptitle(f"Historical vs Forecast - Industry {industry_id}", fontsize=14)
    
    pollutants = ["CO2", "SO2", "BOD", "COD"]
    colors = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12"]
    
    for idx, (ax, pollutant, color) in enumerate(zip(axes.flat, pollutants, colors)):
        # Historical
        ax.plot(hist["Date"], hist[pollutant], marker='o', label="Historical", 
                color=color, linewidth=2, markersize=4)
        
        # Forecast point
        forecast_date = pd.to_datetime(forecast["Predicted_Date"])
        forecast_value = forecast[pollutant]
        ax.scatter([forecast_date], [forecast_value], color='red', s=100, 
                   label="Forecast", marker='*', zorder=5)
        
        ax.set_xlabel("Date")
        ax.set_ylabel(f"{pollutant} Emissions")
        ax.set_title(pollutant)
        ax.legend()
        ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    if save:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"output_historical_forecast_{industry_id}_{timestamp}.png"
        plt.savefig(os.path.join(DATA_DIR, filename), dpi=150, bbox_inches='tight')
        print(f"✓ Saved: {filename}")
    
    return fig

def plot_severity_ranking(forecast_result, save=True):
    """Plot severity ranking for a single industry prediction"""
    
    limits = {"CO2": 5000, "SO2": 80, "BOD": 250, "COD": 500}
    
    normalized = {
        "CO2": forecast_result["CO2"] / limits["CO2"],
        "SO2": forecast_result["SO2"] / limits["SO2"],
        "BOD": forecast_result["BOD"] / limits["BOD"],
        "COD": forecast_result["COD"] / limits["COD"]
    }
    
    ranked = sorted(normalized.items(), key=lambda x: x[1], reverse=True)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    pollutants = [r[0] for r in ranked]
    values = [r[1] for r in ranked]
    colors = ['#e74c3c' if v > 0.7 else '#f39c12' if v > 0.4 else '#2ecc71' for v in values]
    
    bars = ax.barh(pollutants, values, color=colors)
    ax.set_xlabel("Normalized Emission Level (% of Limit)")
    ax.set_title(f"Severity Ranking - Industry {forecast_result['Industry_ID']}")
    ax.axvline(x=0.4, color='orange', linestyle='--', label='Moderate Threshold')
    ax.axvline(x=0.7, color='red', linestyle='--', label='Critical Threshold')
    ax.legend()
    ax.grid(True, alpha=0.3, axis='x')
    
    plt.tight_layout()
    
    if save:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"output_severity_ranking_{forecast_result['Industry_ID']}_{timestamp}.png"
        plt.savefig(os.path.join(DATA_DIR, filename), dpi=150, bbox_inches='tight')
        print(f"✓ Saved: {filename}")
    
    return fig

def plot_scenario_comparison(comparison, save=True):
    """Plot baseline vs scenario comparison"""
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    pollutants = ["CO2", "SO2", "BOD", "COD"]
    baseline_values = [comparison[f"Baseline_{p}"] for p in pollutants]
    scenario_values = [comparison[f"Scenario_{p}"] for p in pollutants]
    
    x = np.arange(len(pollutants))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, baseline_values, width, label='Baseline', color='#3498db')
    bars2 = ax.bar(x + width/2, scenario_values, width, label='Scenario', color='#e74c3c')
    
    ax.set_xlabel("Pollutant")
    ax.set_ylabel("Emission Level")
    ax.set_title(f"Scenario Comparison - Industry {comparison['Industry_ID']}")
    ax.set_xticks(x)
    ax.set_xticklabels(pollutants)
    ax.legend()
    ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    
    if save:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"output_scenario_comparison_{comparison['Industry_ID']}_{timestamp}.png"
        plt.savefig(os.path.join(DATA_DIR, filename), dpi=150, bbox_inches='tight')
        print(f"✓ Saved: {filename}")
    
    return fig

def plot_composite_index_trend(forecast_results, save=True):
    """Plot composite index for all industries"""
    
    limits = {"CO2": 5000, "SO2": 80, "BOD": 250, "COD": 500}
    weights = {"CO2": 0.30, "SO2": 0.25, "BOD": 0.25, "COD": 0.20}
    
    indices = []
    industry_ids = []
    
    for result in forecast_results:
        index = sum(
            weights[p] * (result[p] / limits[p]) 
            for p in ["CO2", "SO2", "BOD", "COD"]
        )
        indices.append(index)
        industry_ids.append(result["Industry_ID"])
    
    fig, ax = plt.subplots(figsize=(12, 6))
    
    colors = ['#e74c3c' if idx > 0.7 else '#f39c12' if idx > 0.4 else '#2ecc71' for idx in indices]
    
    ax.bar(range(len(indices)), indices, color=colors)
    ax.axhline(y=0.4, color='orange', linestyle='--', label='Moderate Threshold', linewidth=2)
    ax.axhline(y=0.7, color='red', linestyle='--', label='Critical Threshold', linewidth=2)
    ax.set_xlabel("Industry Index")
    ax.set_ylabel("Composite Emission Index")
    ax.set_title("Composite Emission Index - All Industries")
    ax.legend()
    ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    
    if save:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"output_composite_index_{timestamp}.png"
        plt.savefig(os.path.join(DATA_DIR, filename), dpi=150, bbox_inches='tight')
        print(f"✓ Saved: {filename}")
    
    return fig

def plot_risk_vs_target(forecast_result, save=True):
    """Plot predicted emissions vs regulatory limits"""
    
    limits = {"CO2": 5000, "SO2": 80, "BOD": 250, "COD": 500}
    
    pollutants = ["CO2", "SO2", "BOD", "COD"]
    predicted = [forecast_result[p] for p in pollutants]
    targets = [limits[p] for p in pollutants]
    risk_pct = [(forecast_result[p] / limits[p]) * 100 for p in pollutants]
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    x = np.arange(len(pollutants))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, targets, width, label='Regulatory Limit', color='#2ecc71', alpha=0.7)
    bars2 = ax.bar(x + width/2, predicted, width, label='Predicted Emission', color='#e74c3c')
    
    # Add risk percentage labels
    for i, (bar, pct) in enumerate(zip(bars2, risk_pct)):
        height = bar.get_height()
        color = 'red' if pct > 100 else 'orange' if pct > 70 else 'green'
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{pct:.1f}%', ha='center', va='bottom', fontweight='bold', color=color)
    
    ax.set_xlabel("Pollutant")
    ax.set_ylabel("Emission Level")
    ax.set_title(f"Risk vs Target - Industry {forecast_result['Industry_ID']}")
    ax.set_xticks(x)
    ax.set_xticklabels(pollutants)
    ax.legend()
    ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    
    if save:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"output_risk_vs_target_{forecast_result['Industry_ID']}_{timestamp}.png"
        plt.savefig(os.path.join(DATA_DIR, filename), dpi=150, bbox_inches='tight')
        print(f"✓ Saved: {filename}")
    
    return fig

def plot_industry_ranking(ranking_df, save=True):
    """Plot industry ranking by composite index"""
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Sort by composite index
    ranking_df = ranking_df.sort_values("Composite_Index", ascending=False)
    
    # Take top 20 for visibility
    top_n = min(20, len(ranking_df))
    plot_df = ranking_df.head(top_n)
    
    colors = ['#e74c3c' if idx > 0.7 else '#f39c12' if idx > 0.4 else '#2ecc71' 
              for idx in plot_df["Composite_Index"]]
    
    bars = ax.barh(range(len(plot_df)), plot_df["Composite_Index"], color=colors)
    ax.set_yticks(range(len(plot_df)))
    ax.set_yticklabels([f"Industry {id}" for id in plot_df["Industry_ID"]])
    ax.set_xlabel("Composite Emission Index")
    ax.set_title(f"Industry Ranking (Top {top_n} by Risk)")
    ax.axvline(x=0.4, color='orange', linestyle='--', label='Moderate', linewidth=2)
    ax.axvline(x=0.7, color='red', linestyle='--', label='Critical', linewidth=2)
    ax.legend()
    ax.grid(True, alpha=0.3, axis='x')
    
    plt.tight_layout()
    
    if save:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"output_industry_ranking_{timestamp}.png"
        plt.savefig(os.path.join(DATA_DIR, filename), dpi=150, bbox_inches='tight')
        print(f"✓ Saved: {filename}")
    
    return fig

if __name__ == "__main__":
    print("Visualization module ready")
    print("Use individual plot functions to generate charts")


def plot_mitigation_comparison(current_index, projected_index, industry_id, countermeasure, save=True):
    """Plot current vs projected index after countermeasure"""
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    categories = ['Current', 'Projected']
    values = [current_index, projected_index]
    colors = ['#e74c3c' if current_index > 0.7 else '#f39c12', 
              '#2ecc71' if projected_index < 0.4 else '#f39c12']
    
    bars = ax.bar(categories, values, color=colors, width=0.5)
    
    # Add improvement arrow
    improvement_pct = ((current_index - projected_index) / current_index) * 100
    arrow_y = max(values) * 0.5
    ax.annotate('', xy=(1, projected_index), xytext=(0, current_index),
                arrowprops=dict(arrowstyle='->', lw=2, color='green'))
    ax.text(0.5, arrow_y, f'{improvement_pct:.1f}% improvement', 
            ha='center', fontsize=12, fontweight='bold', color='green')
    
    ax.set_ylabel("Composite Emission Index")
    ax.set_title(f"Mitigation Impact - Industry {industry_id}\n{countermeasure}")
    ax.axhline(y=0.4, color='orange', linestyle='--', label='Moderate Threshold', linewidth=2)
    ax.axhline(y=0.7, color='red', linestyle='--', label='Critical Threshold', linewidth=2)
    ax.legend()
    ax.grid(True, alpha=0.3, axis='y')
    
    # Add value labels on bars
    for bar, val in zip(bars, values):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{val:.3f}', ha='center', va='bottom', fontweight='bold')
    
    plt.tight_layout()
    
    if save:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"output_mitigation_comparison_{industry_id}_{timestamp}.png"
        plt.savefig(os.path.join(DATA_DIR, filename), dpi=150, bbox_inches='tight')
        print(f"✓ Saved: {filename}")
    
    return fig

def plot_trend_analysis(industry_id, save=True):
    """Plot historical trend for an industry from trend_history.csv"""
    
    if not os.path.exists(TREND_FILE):
        print("⚠ No trend history available")
        return None
    
    trend = pd.read_csv(TREND_FILE)
    trend = trend[trend["Industry_ID"] == industry_id]
    
    if len(trend) == 0:
        print(f"⚠ No trend data for Industry {industry_id}")
        return None
    
    trend["Date"] = pd.to_datetime(trend["Date"])
    trend = trend.sort_values("Date")
    
    fig, ax = plt.subplots(figsize=(12, 6))
    
    ax.plot(trend["Date"], trend["Composite_Index"], marker='o', linewidth=2, 
            markersize=6, color='#3498db', label='Composite Index')
    
    # Add trend arrow
    if len(trend) >= 2:
        first_val = trend["Composite_Index"].iloc[0]
        last_val = trend["Composite_Index"].iloc[-1]
        trend_direction = "↑ Worsening" if last_val > first_val else "↓ Improving"
        trend_color = 'red' if last_val > first_val else 'green'
        
        ax.text(0.02, 0.98, trend_direction, transform=ax.transAxes,
                fontsize=14, fontweight='bold', color=trend_color,
                verticalalignment='top', bbox=dict(boxstyle='round', 
                facecolor='white', alpha=0.8))
    
    ax.axhline(y=0.4, color='orange', linestyle='--', label='Moderate Threshold', linewidth=2)
    ax.axhline(y=0.7, color='red', linestyle='--', label='Critical Threshold', linewidth=2)
    ax.set_xlabel("Date")
    ax.set_ylabel("Composite Emission Index")
    ax.set_title(f"Emission Trend Analysis - Industry {industry_id}")
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    
    if save:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"output_trend_analysis_{industry_id}_{timestamp}.png"
        plt.savefig(os.path.join(DATA_DIR, filename), dpi=150, bbox_inches='tight')
        print(f"✓ Saved: {filename}")
    
    return fig
