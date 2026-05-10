"""
Smart Traffic Prediction System — Analysis Generator
=====================================================
Pre-computes analytics data for the React dashboard.
Uses the actual category values from delhi_traffic_features.csv.
"""

import os, json, pickle
import numpy as np
import pandas as pd

SAVE_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'delhi_traffic_features.csv')


def load_dataframe():
    df = pd.read_csv(DATA_PATH)
    if 'Trip_ID' in df.columns:
        df = df.drop(columns=['Trip_ID'])
    return df


def time_of_day_patterns(df):
    """Use exact category names from the dataset."""
    g = df.groupby('time_of_day')['average_speed_kmph'].agg(['mean', 'std', 'median', 'count'])
    labels = g.index.tolist()
    return {
        'labels': labels,
        'mean': g['mean'].round(1).tolist(),
        'std': g['std'].round(1).tolist(),
        'median': g['median'].round(1).tolist(),
        'count': g['count'].tolist(),
    }


def daily_patterns(df):
    g = df.groupby('day_of_week')['average_speed_kmph'].agg(['mean', 'count'])
    return {
        'days': g.index.tolist(),
        'mean': g['mean'].round(1).tolist(),
        'count': g['count'].tolist(),
    }


def density_distribution(df):
    """Traffic density level distribution with avg speed."""
    g = df.groupby('traffic_density_level')['average_speed_kmph'].agg(['mean', 'count'])
    g = g.sort_values('mean', ascending=False)
    return {
        'levels': g.index.tolist(),
        'mean': g['mean'].round(1).tolist(),
        'count': g['count'].tolist(),
    }


def weather_impact(df):
    g = df.groupby('weather_condition')['average_speed_kmph'].agg(['mean', 'count'])
    g = g.sort_values('mean', ascending=True)
    return {
        'categories': g.index.tolist(),
        'mean': g['mean'].round(1).tolist(),
        'count': g['count'].tolist(),
    }


def road_type_impact(df):
    g = df.groupby('road_type')['average_speed_kmph'].agg(['mean', 'count'])
    g = g.sort_values('mean', ascending=False)
    return {
        'categories': g.index.tolist(),
        'mean': g['mean'].round(1).tolist(),
        'count': g['count'].tolist(),
    }


def speed_distribution(df):
    """Histogram of speed values."""
    bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 100]
    labels_list = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80+']
    df_copy = df.copy()
    df_copy['speed_bin'] = pd.cut(df_copy['average_speed_kmph'], bins=bins, labels=labels_list, right=False)
    g = df_copy.groupby('speed_bin', observed=True).size()
    return {
        'bins': g.index.astype(str).tolist(),
        'count': g.tolist(),
    }


def top_routes(df):
    """Most common start-end area combinations with avg speed."""
    df_copy = df.copy()
    df_copy['route'] = df_copy['start_area'] + ' → ' + df_copy['end_area']
    g = df_copy.groupby('route').agg(
        count=('average_speed_kmph', 'count'),
        avg_speed=('average_speed_kmph', 'mean'),
        avg_distance=('distance_km', 'mean'),
    ).sort_values('count', ascending=False).head(10)
    return {
        'routes': g.index.tolist(),
        'count': g['count'].tolist(),
        'avg_speed': g['avg_speed'].round(1).tolist(),
        'avg_distance': g['avg_distance'].round(1).tolist(),
    }


def area_stats(df):
    """Average speed per start area."""
    g = df.groupby('start_area')['average_speed_kmph'].agg(['mean', 'count'])
    g = g.sort_values('mean', ascending=False)
    return {
        'areas': g.index.tolist(),
        'mean': g['mean'].round(1).tolist(),
        'count': g['count'].tolist(),
    }


def cross_analysis(df):
    """Cross tab: time_of_day x road_type → avg speed."""
    pivot = df.pivot_table(
        index='time_of_day', columns='road_type',
        values='average_speed_kmph', aggfunc='mean'
    ).round(1)
    return {
        'times': pivot.index.tolist(),
        'road_types': pivot.columns.tolist(),
        'values': pivot.fillna(0).values.tolist(),
    }


def dataset_stats(df):
    return {
        'total_records': int(len(df)),
        'avg_speed': round(float(df['average_speed_kmph'].mean()), 1),
        'max_speed': float(df['average_speed_kmph'].max()),
        'min_speed': float(df['average_speed_kmph'].min()),
        'median_speed': float(df['average_speed_kmph'].median()),
        'top_start_area': str(df['start_area'].mode().iloc[0]),
        'top_end_area': str(df['end_area'].mode().iloc[0]),
        'unique_areas': int(df['start_area'].nunique()),
        'avg_distance': round(float(df['distance_km'].mean()), 1),
    }


def generate_all():
    print("[Analysis] Loading data...")
    df = load_dataframe()
    print(f"[Analysis] {len(df)} records loaded")
    print(f"[Analysis] time_of_day categories: {df['time_of_day'].unique().tolist()}")
    print("[Analysis] Computing analytics...")

    analysis = {
        'dataset_stats': dataset_stats(df),
        'time_of_day_patterns': time_of_day_patterns(df),
        'daily_patterns': daily_patterns(df),
        'density_distribution': density_distribution(df),
        'weather_impact': weather_impact(df),
        'road_type_impact': road_type_impact(df),
        'speed_distribution': speed_distribution(df),
        'top_routes': top_routes(df),
        'area_stats': area_stats(df),
        'cross_analysis': cross_analysis(df),
    }

    path = os.path.join(SAVE_DIR, 'analysis_results.json')
    with open(path, 'w') as f:
        json.dump(analysis, f, indent=2)
    print(f"[Analysis] Saved -> {path}")
    return analysis


if __name__ == '__main__':
    generate_all()
