"""
Smart Traffic Prediction System — Analysis Generator
=====================================================
Pre-computes analytics data for the React dashboard.
"""

import os, json, pickle
import numpy as np
import pandas as pd

SAVE_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')


def load_dataframe():
    path = os.path.join(SAVE_DIR, 'pipeline_artefacts.pkl')
    with open(path, 'rb') as f:
        artefacts = pickle.load(f)
    return artefacts['df']


def hourly_patterns(df):
    g = df.groupby('hour')['traffic_volume'].agg(['mean','std','median'])
    return {'hours': list(range(24)), 'mean': g['mean'].round(0).tolist(),
            'std': g['std'].round(0).tolist(), 'median': g['median'].round(0).tolist()}


def daily_patterns(df):
    names = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    g = df.groupby('day_of_week')['traffic_volume'].mean()
    return {'days': names, 'mean': g.round(0).tolist()}


def weekly_heatmap(df):
    pivot = df.pivot_table(values='traffic_volume', index='day_of_week',
                           columns='hour', aggfunc='mean').round(0)
    return {'days': ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            'hours': list(range(24)), 'values': pivot.values.tolist()}


def weather_impact(df):
    g = df.groupby('weather_main')['traffic_volume'].agg(['mean','count'])
    g = g.sort_values('mean', ascending=False)
    return {'categories': g.index.tolist(), 'mean': g['mean'].round(0).tolist(),
            'count': g['count'].tolist()}


def monthly_trends(df):
    names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    g = df.groupby('month')['traffic_volume'].mean()
    return {'months': names, 'mean': g.round(0).tolist()}


def holiday_effect(df):
    is_hol = df['holiday'].notna()
    h = df[is_hol]['traffic_volume']
    r = df[~is_hol]['traffic_volume']
    
    h_mean = float(h.mean()) if len(h) > 0 else 0.0
    r_mean = float(r.mean()) if len(r) > 0 else 0.0
    red = (1 - h_mean/r_mean)*100 if r_mean > 0 else 0.0
    
    return {'holiday_mean': round(h_mean,0), 'regular_mean': round(r_mean,0),
            'holiday_count': int(h.count()), 'regular_count': int(r.count()),
            'reduction_pct': round(red, 1)}


def temperature_impact(df):
    d = df.copy()
    d['temp_bin'] = pd.cut(d['temp_celsius'], bins=[-40,-20,-10,0,10,20,30,40],
        labels=['-40~-20','-20~-10','-10~0','0~10','10~20','20~30','30~40'])
    g = d.groupby('temp_bin', observed=True)['traffic_volume'].mean()
    return {'bins': g.index.astype(str).tolist(), 'mean': g.fillna(0).round(0).tolist()}


def dataset_stats(df):
    day_names = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    return {
        'total_records': int(len(df)),
        'date_start': str(df['date_time'].min().date()),
        'date_end': str(df['date_time'].max().date()),
        'avg_volume': round(float(df['traffic_volume'].mean()), 0),
        'max_volume': int(df['traffic_volume'].max()),
        'min_volume': int(df['traffic_volume'].min()),
        'peak_hour': int(df.groupby('hour')['traffic_volume'].mean().idxmax()),
        'low_hour': int(df.groupby('hour')['traffic_volume'].mean().idxmin()),
        'busiest_day': day_names[int(df.groupby('day_of_week')['traffic_volume'].mean().idxmax())],
    }


def generate_all():
    print("[Analysis] Loading data...")
    df = load_dataframe()
    print("[Analysis] Computing analytics...")
    analysis = {
        'dataset_stats': dataset_stats(df),
        'hourly_patterns': hourly_patterns(df),
        'daily_patterns': daily_patterns(df),
        'weekly_heatmap': weekly_heatmap(df),
        'weather_impact': weather_impact(df),
        'monthly_trends': monthly_trends(df),
        'holiday_effect': holiday_effect(df),
        'temperature_impact': temperature_impact(df),
    }
    path = os.path.join(SAVE_DIR, 'analysis_results.json')
    with open(path, 'w') as f:
        json.dump(analysis, f, indent=2)
    print(f"[Analysis] Saved -> {path}")
    return analysis


if __name__ == '__main__':
    generate_all()
