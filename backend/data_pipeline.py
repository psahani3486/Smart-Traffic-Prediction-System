"""
Smart Traffic Prediction System — Data Pipeline
=================================================
Handles data loading, cleaning, feature engineering, normalization,
sequence creation, and train/test splitting.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler, LabelEncoder

# ── Configuration ───────────────────────────────────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'Metro_Interstate_Traffic_Volume.csv')
SAVE_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
SEQUENCE_LENGTH = 24   # Use past 24 hours to predict next hour
TEST_SPLIT = 0.2       # 20 % held out for testing


def load_and_clean(path: str = DATA_PATH) -> pd.DataFrame:
    """Load CSV, parse dates, remove duplicates, sort chronologically."""
    df = pd.read_csv(path)
    df['date_time'] = pd.to_datetime(df['date_time'], format='%d-%m-%Y %H:%M')
    # Keep first occurrence for duplicate timestamps
    df = df.drop_duplicates(subset=['date_time'], keep='first')
    df = df.sort_values('date_time').reset_index(drop=True)
    print(f"[Pipeline] Loaded {len(df)} records  |  "
          f"Date range: {df['date_time'].min()} -> {df['date_time'].max()}")
    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create rich temporal + weather features."""
    df = df.copy()

    # ── Temporal features ──────────────────────────────────────────────────
    df['hour'] = df['date_time'].dt.hour
    df['day_of_week'] = df['date_time'].dt.dayofweek        # 0=Mon .. 6=Sun
    df['month'] = df['date_time'].dt.month
    df['day_of_year'] = df['date_time'].dt.dayofyear
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)

    # Rush-hour flags
    df['is_morning_rush'] = ((df['hour'] >= 7) & (df['hour'] <= 9)).astype(int)
    df['is_evening_rush'] = ((df['hour'] >= 16) & (df['hour'] <= 18)).astype(int)
    df['is_rush_hour'] = (df['is_morning_rush'] | df['is_evening_rush']).astype(int)

    # Cyclical encoding of hour & month (sin/cos)
    df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
    df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
    df['dow_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
    df['dow_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)

    # ── Temperature to Celsius ─────────────────────────────────────────────
    df['temp_celsius'] = df['temp'] - 273.15

    # ── Holiday binary ─────────────────────────────────────────────────────
    df['is_holiday'] = df['holiday'].notna().astype(int)

    # ── Weather encoding ───────────────────────────────────────────────────
    weather_cats = ['Clear', 'Clouds', 'Rain', 'Snow', 'Mist', 'Drizzle',
                    'Haze', 'Fog', 'Thunderstorm', 'Squall', 'Smoke']
    for cat in weather_cats:
        df[f'weather_{cat.lower()}'] = (df['weather_main'] == cat).astype(int)

    return df


def select_features(df: pd.DataFrame):
    """Select model features and target variable."""
    feature_cols = [
        'hour', 'day_of_week', 'month', 'is_weekend',
        'is_morning_rush', 'is_evening_rush', 'is_rush_hour',
        'hour_sin', 'hour_cos', 'month_sin', 'month_cos',
        'dow_sin', 'dow_cos',
        'temp_celsius', 'rain_1h', 'snow_1h', 'clouds_all',
        'is_holiday',
        'weather_clear', 'weather_clouds', 'weather_rain',
        'weather_snow', 'weather_mist', 'weather_drizzle',
        'weather_haze', 'weather_fog', 'weather_thunderstorm',
    ]
    target_col = 'traffic_volume'
    return feature_cols, target_col


def create_sequences(features: np.ndarray, target: np.ndarray,
                     seq_len: int = SEQUENCE_LENGTH):
    """Build sliding-window sequences for time-series forecasting."""
    X, y = [], []
    for i in range(seq_len, len(features)):
        X.append(features[i - seq_len:i])
        y.append(target[i])
    return np.array(X), np.array(y)


def run_pipeline(path: str = DATA_PATH, save: bool = True):
    """Execute the full data pipeline and return artefacts."""
    os.makedirs(SAVE_DIR, exist_ok=True)

    # 1. Load & clean
    df = load_and_clean(path)

    # 2. Feature engineering
    df = engineer_features(df)

    # 3. Select features
    feature_cols, target_col = select_features(df)
    print(f"[Pipeline] Using {len(feature_cols)} features")

    # 4. Scale features + target
    feature_scaler = MinMaxScaler()
    target_scaler = MinMaxScaler()

    features_scaled = feature_scaler.fit_transform(df[feature_cols].values)
    target_scaled = target_scaler.fit_transform(
        df[target_col].values.reshape(-1, 1)
    ).flatten()

    # 5. Create sequences
    X, y = create_sequences(features_scaled, target_scaled, SEQUENCE_LENGTH)
    print(f"[Pipeline] Sequences: X={X.shape}, y={y.shape}")

    # 6. Chronological train/test split
    split_idx = int(len(X) * (1 - TEST_SPLIT))
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    print(f"[Pipeline] Train: {X_train.shape[0]}  |  Test: {X_test.shape[0]}")

    # 7. Save artefacts (lightweight for deployment)
    if save:
        artefacts = {
            'feature_scaler': feature_scaler,
            'target_scaler': target_scaler,
            'feature_cols': feature_cols,
            'target_col': target_col,
            'sequence_length': SEQUENCE_LENGTH,
        }
        save_path = os.path.join(SAVE_DIR, 'pipeline_artefacts.pkl')
        with open(save_path, 'wb') as f:
            pickle.dump(artefacts, f)
        print(f"[Pipeline] Artefacts saved -> {save_path}")

    return {
        'X_train': X_train, 'X_test': X_test,
        'y_train': y_train, 'y_test': y_test,
        'feature_scaler': feature_scaler,
        'target_scaler': target_scaler,
        'feature_cols': feature_cols,
        'target_col': target_col,
        'sequence_length': SEQUENCE_LENGTH,
        'df': df,
    }


if __name__ == '__main__':
    run_pipeline()
