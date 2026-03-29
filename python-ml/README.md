# 🧠 NexusForge DL Microservice

A standalone Python deep learning service that runs **alongside** the existing Node.js + React project. It provides 3 trained neural network models to intelligently analyze user prompts and images, and enriches the Gemini AI prompt with structured results.

## Architecture

```
React (5173) → Node.js (5000) → Python FastAPI (8000)
                     │                    │
                     └──→ Gemini AI ←─────┘ 
                     (enriched context from DL models)
```

---

## 3 Deep Learning Models

| # | Model | Architecture | Task |
|---|---|---|---|
| 1 | **CNN** | MobileNetV2 (Transfer Learning) | Classifies uploaded mockup images → UI type (dashboard, landing page, etc.) |
| 2 | **LSTM + ANN** | Bidirectional LSTM + Dense layers | Classifies user text prompt → build intent + components needed |
| 3 | **ANN** | Multi-Layer Perceptron (MLP) + BatchNorm | Predicts ideal file/folder structure for the detected project type |

---

## Setup and Run

### Step 1 — Install Python (if not installed)
Download from https://python.org (version 3.10 or 3.11 recommended)

### Step 2 — Install dependencies

```bash
cd "c:\Users\mallikarjun\Desktop\ai website\python-ml"
pip install -r requirements.txt
```

> ⚠️ TensorFlow install takes a few minutes. Be patient.

### Step 3 — Start the microservice

```bash
python app.py
```

The service starts at **http://127.0.0.1:8000**

Interactive API docs: **http://127.0.0.1:8000/docs**

### Step 4 — Start the main project (in a separate terminal as usual)

```bash
cd "c:\Users\mallikarjun\Desktop\ai website"
npm run dev
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Check that the service is running |
| POST | `/analyze-image` | CNN: classify a base64 design image |
| POST | `/classify-intent` | LSTM+ANN: classify a text prompt |
| POST | `/predict-structure` | ANN: predict file structure |
| POST | `/full-analysis` | All 3 models combined (used by Node.js) |

---

## How It Integrates

When you send a message to the AI chat in the app:
1. Node.js first calls `POST /full-analysis` with your prompt + image
2. CNN detects UI type from the image
3. LSTM+ANN detects your build intent from the text
4. ANN predicts the ideal file structure
5. All results are injected into the Gemini prompt as structured context
6. Gemini generates better, more structured code based on DL analysis

If this service is **offline**, the app still works normally — Node.js gracefully falls back to calling Gemini directly.
