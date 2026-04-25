"""
Smart Traffic Prediction System — FastAPI Backend
===================================================
Serves predictions and analytics data to the React dashboard.
"""

import os, json, pickle
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from keras.models import load_model

from data_pipeline import run_pipeline

SAVE_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')

app = FastAPI(title="Smart Traffic Prediction API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

# ── Load artefacts on startup ───────────────────────────────────────────────
model = None
artefacts = None
analysis = None
training_report = None


def load_resources():
    global model, artefacts, analysis, training_report
    # Pipeline artefacts
    art_path = os.path.join(SAVE_DIR, 'pipeline_artefacts.pkl')
    if os.path.exists(art_path):
        with open(art_path, 'rb') as f:
            artefacts = pickle.load(f)
        print("[API] Pipeline artefacts loaded")
    else:
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'Metro_Interstate_Traffic_Volume.csv')
        if os.path.exists(csv_path):
            print("[API] Pipeline artefacts missing; rebuilding from dataset")
            artefacts = run_pipeline(csv_path, save=True)
        else:
            print("[API] Pipeline artefacts missing and dataset not found")

    # Training report
    rep_path = os.path.join(SAVE_DIR, 'training_report.json')
    if os.path.exists(rep_path):
        with open(rep_path, 'r') as f:
            training_report = json.load(f)
        # Load best model
        best = training_report.get('best_model', 'Stacked_LSTM')
        model_path = os.path.join(SAVE_DIR, f'{best}.keras')
        if os.path.exists(model_path):
            model = load_model(model_path)
            print(f"[API] Best model loaded: {best}")

    # Analysis results
    ana_path = os.path.join(SAVE_DIR, 'analysis_results.json')
    if os.path.exists(ana_path):
        with open(ana_path, 'r') as f:
            analysis = json.load(f)
        print("[API] Analysis results loaded")


load_resources()


# ── Pydantic models ────────────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    hour: int = 8
    day_of_week: int = 0
    month: int = 6
    temp_celsius: float = 20.0
    rain_1h: float = 0.0
    snow_1h: float = 0.0
    clouds_all: int = 40
    is_holiday: int = 0
    weather: str = "Clear"


# ── Endpoints ──────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/api/predict")
def predict(req: PredictionRequest):
    if model is None or artefacts is None:
        return {"error": "Model not loaded"}

    feature_cols = artefacts['feature_cols']
    feature_scaler = artefacts['feature_scaler']
    target_scaler = artefacts['target_scaler']
    seq_len = artefacts['sequence_length']

    # Build a single feature vector
    weather_cats = ['Clear','Clouds','Rain','Snow','Mist','Drizzle',
                    'Haze','Fog','Thunderstorm']
    import math
    feat = {
        'hour': req.hour,
        'day_of_week': req.day_of_week,
        'month': req.month,
        'is_weekend': 1 if req.day_of_week >= 5 else 0,
        'is_morning_rush': 1 if 7 <= req.hour <= 9 else 0,
        'is_evening_rush': 1 if 16 <= req.hour <= 18 else 0,
        'is_rush_hour': 1 if (7 <= req.hour <= 9 or 16 <= req.hour <= 18) else 0,
        'hour_sin': math.sin(2*math.pi*req.hour/24),
        'hour_cos': math.cos(2*math.pi*req.hour/24),
        'month_sin': math.sin(2*math.pi*req.month/12),
        'month_cos': math.cos(2*math.pi*req.month/12),
        'dow_sin': math.sin(2*math.pi*req.day_of_week/7),
        'dow_cos': math.cos(2*math.pi*req.day_of_week/7),
        'temp_celsius': req.temp_celsius,
        'rain_1h': req.rain_1h,
        'snow_1h': req.snow_1h,
        'clouds_all': req.clouds_all,
        'is_holiday': req.is_holiday,
    }
    for cat in weather_cats:
        feat[f'weather_{cat.lower()}'] = 1 if req.weather == cat else 0

    vec = np.array([[feat.get(c, 0) for c in feature_cols]], dtype=np.float64)
    vec_scaled = feature_scaler.transform(vec)

    # Repeat to fill sequence
    seq = np.tile(vec_scaled, (seq_len, 1)).reshape(1, seq_len, -1)
    pred_scaled = model.predict(seq, verbose=0).flatten()[0]
    pred_volume = float(target_scaler.inverse_transform([[pred_scaled]])[0][0])
    pred_volume = max(0, pred_volume)

    # Congestion level
    if pred_volume < 1500:
        level = "Low"
    elif pred_volume < 3500:
        level = "Moderate"
    elif pred_volume < 5500:
        level = "High"
    else:
        level = "Critical"

    return {
        "predicted_volume": round(pred_volume),
        "congestion_level": level,
        "input": req.model_dump(),
    }


@app.get("/api/analysis")
def get_analysis():
    if analysis is None:
        return {"error": "Analysis not generated"}
    return analysis


@app.get("/api/model-info")
def get_model_info():
    if training_report is None:
        return {"error": "No training report"}
    return {
        "best_model": training_report.get("best_model"),
        "models": training_report.get("models"),
        "histories": training_report.get("histories"),
    }


@app.get("/api/predictions/sample")
def get_sample_predictions():
    if training_report is None:
        return {"error": "No training report"}
    return training_report.get("predictions", {})


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
