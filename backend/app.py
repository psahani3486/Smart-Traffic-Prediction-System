"""
Smart Traffic Prediction System — FastAPI Backend
===================================================
Serves predictions and analytics data to the React dashboard using Tabular DNN models.
"""

import os, json, pickle
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tflite_runtime.interpreter as tflite

from data_pipeline import run_pipeline

SAVE_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')

app = FastAPI(title="Smart Traffic Prediction API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

interpreter = None
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
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'delhi_traffic_features.csv')
        if os.path.exists(csv_path):
            print("[API] Pipeline artefacts missing; rebuilding from dataset")
            artefacts = run_pipeline(csv_path, save=True)

    # Training report
    rep_path = os.path.join(SAVE_DIR, 'training_report.json')
    if os.path.exists(rep_path):
        with open(rep_path, 'r') as f:
            training_report = json.load(f)
        # Load best model
        best = training_report.get('best_model', 'DNN_Basic')
        tflite_path = os.path.join(SAVE_DIR, f'{best}.tflite')
        if os.path.exists(tflite_path):
            global interpreter, input_details, output_details
            interpreter = tflite.Interpreter(model_path=tflite_path)
            interpreter.allocate_tensors()
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            print(f"[API] Best TFLite model loaded: {best}")

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
    return {"status": "ok", "model_loaded": interpreter is not None}

@app.post("/api/predict")
def predict(req: PredictionRequest):
    if interpreter is None or artefacts is None:
        return {"error": "Model not loaded"}

    # Prepare data for prediction
    categorical_cols = artefacts['categorical_cols']
    numerical_cols = artefacts['numerical_cols']
    ohe = artefacts['ohe']
    num_scaler = artefacts['num_scaler']

    req_dict = req.model_dump()
    
    # Extract numerical features
    num_data = np.array([[req_dict[col] for col in numerical_cols]])
    scaled_nums = num_scaler.transform(num_data)

    # Extract categorical features
    cat_data = np.array([[req_dict[col] for col in categorical_cols]])
    encoded_cats = ohe.transform(cat_data)

    # Combine
    X_input = np.hstack([scaled_nums, encoded_cats])

    # Predict speed using TFLite
    interpreter.set_tensor(input_details[0]['index'], X_input.astype(np.float32))
    interpreter.invoke()
    pred_speed = interpreter.get_tensor(output_details[0]['index'])[0][0]
    pred_speed = max(0, float(pred_speed))

    # Derive congestion level
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

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
