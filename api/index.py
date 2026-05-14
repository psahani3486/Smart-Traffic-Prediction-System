"""
Vercel Serverless Function — API Handler
==========================================
This file is structured specifically for Vercel's @vercel/python runtime.
It serves pre-computed JSON data and handles predictions using ONNX Runtime.
"""

import os, json, pickle
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import onnxruntime as ort

# ── Resolve paths relative to THIS file ────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVE_DIR = os.path.join(BASE_DIR, '..', 'backend', 'saved_models')

app = FastAPI(title="Smart Traffic Prediction API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

# ── Load resources at cold-start ───────────────────────────────────────────
ort_session = None
input_name = None
artefacts = None
analysis = None
training_report = None

def load_resources():
    global ort_session, input_name, artefacts, analysis, training_report

    # Pipeline artefacts (pickle with sklearn objects)
    art_path = os.path.join(SAVE_DIR, 'pipeline_artefacts.pkl')
    if os.path.exists(art_path):
        with open(art_path, 'rb') as f:
            artefacts = pickle.load(f)
        print("[API] Pipeline artefacts loaded")

    # Training report
    rep_path = os.path.join(SAVE_DIR, 'training_report.json')
    if os.path.exists(rep_path):
        with open(rep_path, 'r') as f:
            training_report = json.load(f)
        best = training_report.get('best_model', 'DNN_Basic')
        onnx_path = os.path.join(SAVE_DIR, f'{best}.onnx')
        if os.path.exists(onnx_path):
            ort_session = ort.InferenceSession(onnx_path)
            input_name = ort_session.get_inputs()[0].name
            print(f"[API] ONNX model loaded: {best}")

    # Analysis results
    ana_path = os.path.join(SAVE_DIR, 'analysis_results.json')
    if os.path.exists(ana_path):
        with open(ana_path, 'r') as f:
            analysis = json.load(f)
        print("[API] Analysis results loaded")

load_resources()

# ── Pydantic models ────────────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    start_area: str
    end_area: str
    distance_km: float
    time_of_day: str
    day_of_week: str
    weather_condition: str
    traffic_density_level: str
    road_type: str

# ── Endpoints ──────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "model_loaded": ort_session is not None}

@app.post("/api/predict")
def predict(req: PredictionRequest):
    if ort_session is None or artefacts is None:
        return {"error": "Model not loaded"}

    categorical_cols = artefacts['categorical_cols']
    numerical_cols = artefacts['numerical_cols']
    ohe = artefacts['ohe']
    num_scaler = artefacts['num_scaler']

    req_dict = req.model_dump()

    num_data = np.array([[req_dict[col] for col in numerical_cols]])
    scaled_nums = num_scaler.transform(num_data)

    cat_data = np.array([[req_dict[col] for col in categorical_cols]])
    encoded_cats = ohe.transform(cat_data)

    X_input = np.hstack([scaled_nums, encoded_cats])

    ort_inputs = {input_name: X_input.astype(np.float32)}
    ort_outs = ort_session.run(None, ort_inputs)
    pred_speed = ort_outs[0][0][0]
    pred_speed = max(0, float(pred_speed))

    if pred_speed < 15:
        level = "Critical"
    elif pred_speed < 25:
        level = "High"
    elif pred_speed < 35:
        level = "Moderate"
    else:
        level = "Low"

    return {
        "predicted_speed": round(pred_speed, 1),
        "congestion_level": level,
        "input": req_dict,
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
