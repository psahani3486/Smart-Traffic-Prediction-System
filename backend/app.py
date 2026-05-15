"""
Smart Traffic Prediction System — FastAPI Backend
===================================================
Serves predictions and analytics data to the React dashboard using Tabular DNN models.
"""

import os, json, pickle, time
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import onnxruntime as ort

from data_pipeline import run_pipeline

SAVE_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')

app = FastAPI(title="Smart Traffic Prediction API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

ort_session = None
artefacts = None
analysis = None
training_report = None
cache_time = {}  # Cache loading timestamps

def load_resources():
    global ort_session, artefacts, analysis, training_report
    
    # Pipeline artefacts
    art_path = os.path.join(SAVE_DIR, 'pipeline_artefacts.pkl')
    if os.path.exists(art_path):
        try:
            with open(art_path, 'rb') as f:
                artefacts = pickle.load(f)
            print("[API] Pipeline artefacts loaded (cached)")
        except Exception as e:
            print(f"[API] Error loading artefacts: {e}")
    else:
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'delhi_traffic_features.csv')
        if os.path.exists(csv_path):
            print("[API] Building pipeline artefacts from dataset...")
            start = time.time()
            artefacts = run_pipeline(csv_path, save=True)
            print(f"[API] Pipeline created in {time.time() - start:.2f}s")

    # Training report
    rep_path = os.path.join(SAVE_DIR, 'training_report.json')
    if os.path.exists(rep_path):
        try:
            with open(rep_path, 'r') as f:
                training_report = json.load(f)
            # Load best model
            best = training_report.get('best_model', 'DNN_Basic')
            onnx_path = os.path.join(SAVE_DIR, f'{best}.onnx')
            if os.path.exists(onnx_path):
                ort_session = ort.InferenceSession(onnx_path)
                globals()['input_name'] = ort_session.get_inputs()[0].name
                print(f"[API] Best ONNX model loaded: {best}")
        except Exception as e:
            print(f"[API] Error loading model: {e}")

    # Analysis results
    ana_path = os.path.join(SAVE_DIR, 'analysis_results.json')
    if os.path.exists(ana_path):
        try:
            with open(ana_path, 'r') as f:
                analysis = json.load(f)
            print("[API] Analysis results loaded (cached)")
        except Exception as e:
            print(f"[API] Error loading analysis: {e}")
    else:
        print("[API] Analysis cache missing - will generate on first request")

print("[API] Starting resource loading...")
load_resources()
print("[API] Startup complete")

# Pydantic models
class PredictionRequest(BaseModel):
    start_area: str
    end_area: str
    distance_km: float
    time_of_day: str
    day_of_week: str
    weather_condition: str
    traffic_density_level: str
    road_type: str

# Endpoints
@app.get("/api/health")
def health():
    """Quick health check endpoint"""
    return {
        "status": "ok",
        "model_loaded": ort_session is not None,
        "analysis_cached": analysis is not None,
        "artefacts_ready": artefacts is not None
    }

@app.post("/api/predict")
def predict(req: PredictionRequest):
    """Fast prediction endpoint using ONNX"""
    if ort_session is None or artefacts is None:
        return {"error": "Model not loaded"}

    try:
        categorical_cols = artefacts['categorical_cols']
        numerical_cols = artefacts['numerical_cols']
        ohe = artefacts['ohe']
        num_scaler = artefacts['num_scaler']

        req_dict = req.model_dump()
        
        # Extract and scale numerical features
        num_data = np.array([[req_dict[col] for col in numerical_cols]])
        scaled_nums = num_scaler.transform(num_data)

        # Extract and encode categorical features
        cat_data = np.array([[req_dict[col] for col in categorical_cols]])
        encoded_cats = ohe.transform(cat_data)

        # Combine features
        X_input = np.hstack([scaled_nums, encoded_cats])

        # ONNX prediction
        ort_inputs = {globals()['input_name']: X_input.astype(np.float32)}
        ort_outs = ort_session.run(None, ort_inputs)
        pred_speed = ort_outs[0][0][0]
        pred_speed = max(0, float(pred_speed))

        # Determine congestion level
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
    except Exception as e:
        print(f"[API] Prediction error: {e}")
        return {"error": str(e)}

@app.get("/api/analysis")
def get_analysis():
    """Return cached analysis data"""
    global analysis
    
    if analysis is None:
        # Try to generate on first request (lazy loading)
        try:
            from generate_analysis import generate_all
            print("[API] Generating analysis on first request...")
            start = time.time()
            generate_all()  # This saves to file
            
            # Load the generated analysis
            ana_path = os.path.join(SAVE_DIR, 'analysis_results.json')
            with open(ana_path, 'r') as f:
                analysis = json.load(f)
            print(f"[API] Analysis generated in {time.time() - start:.2f}s")
        except Exception as e:
            print(f"[API] Error generating analysis: {e}")
            return {
                "error": "Analysis not available",
                "message": str(e)
            }
    
    return analysis

@app.get("/api/model-info")
def get_model_info():
    """Return model information"""
    if training_report is None:
        return {"error": "No training report"}
    return {
        "best_model": training_report.get("best_model"),
        "models": training_report.get("models"),
        "histories": training_report.get("histories"),
    }

@app.get("/api/predictions/sample")
def get_sample_predictions():
    """Return sample predictions"""
    if training_report is None:
        return {"error": "No training report"}
    return training_report.get("predictions", {})

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
