"""
Smart Traffic Prediction System — Data Pipeline
=================================================
Handles data loading, cleaning, feature engineering, encoding,
and train/test splitting for tabular Delhi Traffic dataset.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder, StandardScaler

# ── Configuration ───────────────────────────────────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'delhi_traffic_features.csv')
SAVE_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
TEST_SPLIT = 0.2

def load_and_clean(path: str = DATA_PATH) -> pd.DataFrame:
    """Load CSV and remove irrelevant columns."""
    df = pd.read_csv(path)
    # Trip_ID is not useful for prediction
    if 'Trip_ID' in df.columns:
        df = df.drop(columns=['Trip_ID'])
    print(f"[Pipeline] Loaded {len(df)} records")
    return df

def run_pipeline(path: str = DATA_PATH, save: bool = True):
    """Execute the full data pipeline and return artefacts."""
    os.makedirs(SAVE_DIR, exist_ok=True)

    # 1. Load & clean
    df = load_and_clean(path)

    # 2. Select Features and Target
    target_col = 'average_speed_kmph'
    
    # Identify column types
    categorical_cols = [
        'start_area', 'end_area', 'time_of_day', 
        'day_of_week', 'weather_condition', 
        'traffic_density_level', 'road_type'
    ]
    numerical_cols = ['distance_km']

    # Make sure we don't include target in features if it's there
    if target_col in categorical_cols:
        categorical_cols.remove(target_col)

    # 3. Encoding and Scaling
    print(f"[Pipeline] Processing features...")
    
    # We use OneHotEncoder for categorical features
    ohe = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    encoded_cats = ohe.fit_transform(df[categorical_cols])
    encoded_cat_names = ohe.get_feature_names_out(categorical_cols)

    # We use StandardScaler for numerical features (distance_km)
    num_scaler = StandardScaler()
    scaled_nums = num_scaler.fit_transform(df[numerical_cols])

    # Combine features
    X = np.hstack([scaled_nums, encoded_cats])
    
    # Target
    y = df[target_col].values

    print(f"[Pipeline] Input shape: {X.shape}")

    # 4. Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SPLIT, random_state=42
    )
    print(f"[Pipeline] Train: {X_train.shape[0]} | Test: {X_test.shape[0]}")

    # 5. Save artefacts
    if save:
        artefacts = {
            'ohe': ohe,
            'num_scaler': num_scaler,
            'categorical_cols': categorical_cols,
            'numerical_cols': numerical_cols,
            'encoded_cat_names': encoded_cat_names.tolist(),
            'target_col': target_col
        }
        save_path = os.path.join(SAVE_DIR, 'pipeline_artefacts.pkl')
        with open(save_path, 'wb') as f:
            pickle.dump(artefacts, f)
        print(f"[Pipeline] Artefacts saved -> {save_path}")

    return {
        'X_train': X_train, 'X_test': X_test,
        'y_train': y_train, 'y_test': y_test,
        'ohe': ohe,
        'num_scaler': num_scaler,
        'categorical_cols': categorical_cols,
        'numerical_cols': numerical_cols,
        'target_col': target_col,
        'df': df,
    }

if __name__ == '__main__':
    run_pipeline()
