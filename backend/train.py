"""
Smart Traffic Prediction System — Training Orchestrator
========================================================
Trains all four models, evaluates, compares, and saves the best.
"""

import os
import json
import pickle
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
from keras.callbacks import EarlyStopping, ReduceLROnPlateau

from data_pipeline import run_pipeline, SAVE_DIR
from models import MODEL_BUILDERS

# ── Configuration ───────────────────────────────────────────────────────────
EPOCHS = 50
BATCH_SIZE = 64
PATIENCE_EARLY = 8
PATIENCE_LR = 4


def evaluate_model(model, X_test, y_test, target_scaler):
    """Compute RMSE, MAE, R², MAPE on test set (in original scale)."""
    y_pred_scaled = model.predict(X_test, verbose=0).flatten()

    # Inverse transform
    y_true = target_scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()
    y_pred = target_scaler.inverse_transform(y_pred_scaled.reshape(-1, 1)).flatten()

    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mae = float(mean_absolute_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))

    # MAPE — avoid division by zero
    mask = y_true != 0
    mape = float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)

    return {
        'rmse': round(rmse, 2),
        'mae': round(mae, 2),
        'r2': round(r2, 4),
        'mape': round(mape, 2),
        'y_true': y_true.tolist(),
        'y_pred': y_pred.tolist(),
    }


def train_all_models():
    """Train every architecture and return comparison results."""
    # 1. Run data pipeline
    print("=" * 60)
    print("  SMART TRAFFIC PREDICTION - TRAINING PIPELINE")
    print("=" * 60)
    artefacts = run_pipeline()

    X_train = artefacts['X_train']
    X_test = artefacts['X_test']
    y_train = artefacts['y_train']
    y_test = artefacts['y_test']
    target_scaler = artefacts['target_scaler']
    input_shape = (X_train.shape[1], X_train.shape[2])

    print(f"\n[Train] Input shape: {input_shape}")
    print(f"[Train] Train samples: {len(X_train)}, Test samples: {len(X_test)}")

    # 2. Callbacks
    early_stop = EarlyStopping(
        monitor='val_loss', patience=PATIENCE_EARLY,
        restore_best_weights=True, verbose=1
    )
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss', factor=0.5,
        patience=PATIENCE_LR, min_lr=1e-6, verbose=1
    )

    results = {}
    histories = {}
    best_r2 = -np.inf
    best_model_name = None

    # 3. Train each model
    for name, builder in MODEL_BUILDERS.items():
        print(f"\n{'-' * 50}")
        print(f"  Training: {name}")
        print(f"{'-' * 50}")

        model = builder(input_shape)
        model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        model.summary()

        history = model.fit(
            X_train, y_train,
            epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            validation_split=0.15,
            callbacks=[early_stop, reduce_lr],
            verbose=1,
        )

        # Evaluate
        metrics = evaluate_model(model, X_test, y_test, target_scaler)
        results[name] = metrics
        histories[name] = {
            'loss': [float(v) for v in history.history['loss']],
            'val_loss': [float(v) for v in history.history['val_loss']],
            'mae': [float(v) for v in history.history['mae']],
            'val_mae': [float(v) for v in history.history['val_mae']],
        }

        print(f"  -> RMSE: {metrics['rmse']}  |  MAE: {metrics['mae']}  "
              f"|  R2: {metrics['r2']}  |  MAPE: {metrics['mape']}%")

        # Save individual model
        model_path = os.path.join(SAVE_DIR, f'{name}.keras')
        model.save(model_path)
        print(f"  -> Saved: {model_path}")

        # Track best
        if metrics['r2'] > best_r2:
            best_r2 = metrics['r2']
            best_model_name = name

    # 4. Save comparison report
    report = {
        'best_model': best_model_name,
        'models': {},
        'histories': histories,
    }
    for name in results:
        report['models'][name] = {
            'rmse': results[name]['rmse'],
            'mae': results[name]['mae'],
            'r2': results[name]['r2'],
            'mape': results[name]['mape'],
        }

    # Save predictions from best model (for charts)
    report['predictions'] = {
        'y_true': results[best_model_name]['y_true'][-500:],
        'y_pred': results[best_model_name]['y_pred'][-500:],
    }

    report_path = os.path.join(SAVE_DIR, 'training_report.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    print(f"\n[Train] Report saved -> {report_path}")
    print(f"[Train] * Best model: {best_model_name} (R2 = {best_r2:.4f})")

    return report


if __name__ == '__main__':
    train_all_models()
