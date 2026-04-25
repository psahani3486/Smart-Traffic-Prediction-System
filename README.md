# Smart Traffic Prediction System 🚦

A production-grade, end-to-end traffic forecasting system using **LSTM Deep Learning**, **FastAPI**, and a **React** dashboard with premium glassmorphism design.

## 🚀 Features

- **Deep Learning Model:** LSTM-based time-series forecasting with an R² score of **0.9341**.
- **Real-time Predictions:** Interactive panel to predict traffic volume based on time, weather, and temperature.
- **Advanced Analytics:** 
  - 24-hour traffic patterns.
  - Weekly congestion heatmaps.
  - Weather & Holiday impact analysis.
  - Seasonal trend decomposition.
- **Smart Routing:** Route recommendations based on current congestion levels.
- **Modern UI:** Stunning dark-mode dashboard with glassmorphism effects and animated visualizations.

## 🛠️ Tech Stack

- **Deep Learning:** TensorFlow, Keras, NumPy, Pandas, Scikit-learn
- **Backend:** FastAPI, Uvicorn, Pydantic
- **Frontend:** React (Vite), Recharts, Lucide-React, Axios, Vanilla CSS
- **Data Source:** Metro Interstate Traffic Volume Dataset

## 📦 Installation & Setup

### 1. Prerequisites
- Python 3.9+
- Node.js 18+

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🧠 Model Comparison
We compared multiple architectures to find the best fit:
- **LSTM (Winner):** Best balance of temporal capture and complexity.
- **Stacked LSTM:** Deeper architecture for complex patterns.
- **Bi-LSTM:** Bidirectional learning for context.
- **GRU:** Efficient gated unit alternative.

## 📊 Dataset
The system uses the **Metro Interstate Traffic Volume Dataset**, which includes:
- Hourly traffic volume
- Weather conditions (Rain, Snow, Clouds, etc.)
- Temperature
- Holiday markers

---
Built with ❤️ for professional-grade portfolio demonstration.
