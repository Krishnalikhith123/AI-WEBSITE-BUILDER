"""
NexusForge AI — Python Deep Learning Microservice
FastAPI server exposing 3 DL model endpoints:
  POST /analyze-image   → CNN Image Classifier (MobileNetV2)
  POST /classify-intent → LSTM + ANN Intent Classifier
  POST /predict-structure → ANN Code Structure Predictor
  GET  /health          → Status check
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from models.image_classifier import classify_image
from models.intent_classifier import classify_intent
from models.structure_predictor import predict_structure

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="NexusForge DL Microservice",
    description="Deep Learning API: CNN + LSTM + ANN models for UI intelligence",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request / Response models ─────────────────────────────────────────────────

class ImageRequest(BaseModel):
    image_base64: str          # Base64-encoded image (data URL or raw)

class IntentRequest(BaseModel):
    prompt: str                # User's natural-language prompt

class StructureRequest(BaseModel):
    project_type: str          # "react" | "html-css-js"
    intent: str                # Intent label from classify-intent

class FullAnalysisRequest(BaseModel):
    prompt: str
    project_type: str
    image_base64: Optional[str] = None


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "online",
        "service": "NexusForge DL Microservice",
        "models": ["CNN (MobileNetV2)", "Bidirectional LSTM + ANN", "ANN MLP (Structure)"],
    }


@app.post("/analyze-image")
def analyze_image(req: ImageRequest):
    """
    Model 1: CNN Image Classifier
    Accepts a base64-encoded design screenshot/mockup.
    Returns predicted UI type (e.g. 'dashboard') and detected components.
    """
    if not req.image_base64:
        raise HTTPException(status_code=400, detail="image_base64 is required")
    result = classify_image(req.image_base64)
    return result


@app.post("/classify-intent")
def classify_intent_route(req: IntentRequest):
    """
    Model 2: Bidirectional LSTM + ANN Intent Classifier
    Accepts a natural-language prompt.
    Returns predicted build intent and suggested components.
    """
    if not req.prompt or not req.prompt.strip():
        raise HTTPException(status_code=400, detail="prompt is required")
    result = classify_intent(req.prompt)
    return result


@app.post("/predict-structure")
def predict_structure_route(req: StructureRequest):
    """
    Model 3: ANN Code Structure Predictor
    Accepts project type + intent.
    Returns ideal file/folder structure for the project.
    """
    result = predict_structure(req.project_type, req.intent)
    return result


@app.post("/full-analysis")
def full_analysis(req: FullAnalysisRequest):
    """
    Combined endpoint: runs all applicable DL models in sequence.
    - Always runs LSTM intent classifier on the prompt
    - If image is provided, runs CNN image classifier
    - Always runs ANN structure predictor using above results
    Returns a merged context object for Gemini enrichment.
    """
    result = {}

    # Step 1: Classify intent from text (LSTM + ANN)
    intent_result = classify_intent(req.prompt)
    result["intent_analysis"] = intent_result
    detected_intent = intent_result.get("predicted_intent", "build_landing_page")

    # Step 2: Classify image if provided (CNN)
    if req.image_base64:
        image_result = classify_image(req.image_base64)
        result["image_analysis"] = image_result
        # Override intent if image gives a clear signal
        cnn_confidence = image_result.get("confidence", 0)
        if cnn_confidence > 0.6:
            cnn_ui_type = image_result.get("predicted_ui_type", "")
            ui_to_intent = {
                "landing_page":    "build_landing_page",
                "dashboard":       "build_dashboard",
                "login_form":      "build_auth_page",
                "ecommerce_store": "build_ecommerce",
                "portfolio":       "build_portfolio",
                "blog_page":       "build_blog",
                "settings_page":   "build_settings",
            }
            if cnn_ui_type in ui_to_intent:
                detected_intent = ui_to_intent[cnn_ui_type]

    # Step 3: Predict code structure (ANN)
    structure_result = predict_structure(req.project_type, detected_intent)
    result["structure_analysis"] = structure_result

    # Step 4: Compose context summary for Gemini
    components = list(set(
        intent_result.get("suggested_components", []) +
        (result.get("image_analysis", {}).get("detected_components", []))
    ))

    result["gemini_context"] = {
        "detected_intent":       detected_intent,
        "suggested_components":  components,
        "recommended_files":     structure_result.get("structure", {}).get("files", []),
        "recommended_folders":   structure_result.get("structure", {}).get("folders", []),
        "complexity":            structure_result.get("structure", {}).get("complexity", "medium"),
        "context_summary": (
            f"DL Analysis: Intent detected as '{detected_intent}'. "
            f"Suggested components: {', '.join(components[:6])}. "
            f"Recommended file structure: {', '.join(structure_result.get('structure', {}).get('files', [])[:5])}."
        )
    }

    return result


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n🚀 NexusForge DL Microservice starting on http://127.0.0.1:8000")
    print("📖 API Docs available at http://127.0.0.1:8000/docs\n")
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
