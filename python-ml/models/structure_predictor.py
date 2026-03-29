"""
Model 3: ANN Code Structure Predictor
Architecture: Fully-connected Dense layers (Multi-Layer Perceptron)
Task: Given project type + detected intent, predict ideal file/folder structure
      and component list using a neural network
"""

import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization

# ── Feature vocabulary ────────────────────────────────────────────────────────
PROJECT_TYPES = ["html-css-js", "react"]

INTENT_LIST = [
    "build_landing_page", "build_dashboard", "build_auth_page",
    "build_ecommerce", "build_portfolio", "build_blog",
    "build_settings", "update_style", "add_component", "fix_bug",
]

# ── Output structure templates ────────────────────────────────────────────────
STRUCTURE_TEMPLATES = {
    # (project_type, intent) → file structure dict
    ("react", "build_landing_page"): {
        "folders":  ["src/components", "src/pages", "src/styles"],
        "files":    ["src/App.jsx", "src/main.jsx", "src/index.css",
                     "src/pages/Home.jsx",
                     "src/components/Navbar.jsx", "src/components/Hero.jsx",
                     "src/components/Features.jsx", "src/components/Footer.jsx"],
        "entry":    "src/main.jsx",
        "complexity": "medium",
    },
    ("react", "build_dashboard"): {
        "folders":  ["src/components", "src/pages", "src/components/charts", "src/styles"],
        "files":    ["src/App.jsx", "src/main.jsx", "src/index.css",
                     "src/pages/Dashboard.jsx",
                     "src/components/Sidebar.jsx", "src/components/TopBar.jsx",
                     "src/components/StatCard.jsx", "src/components/charts/LineChart.jsx",
                     "src/components/DataTable.jsx"],
        "entry":    "src/main.jsx",
        "complexity": "high",
    },
    ("react", "build_auth_page"): {
        "folders":  ["src/components", "src/pages", "src/styles"],
        "files":    ["src/App.jsx", "src/main.jsx", "src/index.css",
                     "src/pages/Login.jsx", "src/pages/Register.jsx",
                     "src/components/AuthCard.jsx", "src/components/InputField.jsx"],
        "entry":    "src/main.jsx",
        "complexity": "low",
    },
    ("react", "build_ecommerce"): {
        "folders":  ["src/components", "src/pages", "src/context", "src/styles"],
        "files":    ["src/App.jsx", "src/main.jsx", "src/index.css",
                     "src/pages/Home.jsx", "src/pages/ProductPage.jsx", "src/pages/Cart.jsx",
                     "src/components/Navbar.jsx", "src/components/ProductCard.jsx",
                     "src/components/CartDrawer.jsx", "src/context/CartContext.jsx"],
        "entry":    "src/main.jsx",
        "complexity": "high",
    },
    ("react", "build_portfolio"): {
        "folders":  ["src/components", "src/pages", "src/styles"],
        "files":    ["src/App.jsx", "src/main.jsx", "src/index.css",
                     "src/pages/Home.jsx",
                     "src/components/Hero.jsx", "src/components/Projects.jsx",
                     "src/components/Skills.jsx", "src/components/Contact.jsx",
                     "src/components/Footer.jsx"],
        "entry":    "src/main.jsx",
        "complexity": "medium",
    },
    ("html-css-js", "build_landing_page"): {
        "folders":  ["css", "js", "assets"],
        "files":    ["index.html", "css/style.css", "css/responsive.css", "js/main.js"],
        "entry":    "index.html",
        "complexity": "low",
    },
    ("html-css-js", "build_ecommerce"): {
        "folders":  ["css", "js", "pages", "assets"],
        "files":    ["index.html", "pages/product.html", "pages/cart.html",
                     "css/style.css", "css/product.css", "js/main.js", "js/cart.js"],
        "entry":    "index.html",
        "complexity": "medium",
    },
    ("html-css-js", "build_auth_page"): {
        "folders":  ["css", "js"],
        "files":    ["index.html", "css/style.css", "js/auth.js", "js/validate.js"],
        "entry":    "index.html",
        "complexity": "low",
    },
}

# ── Default fallbacks ─────────────────────────────────────────────────────────
DEFAULT_REACT  = {"folders": ["src/components", "src/styles"], "files": ["src/App.jsx", "src/main.jsx", "src/index.css"], "entry": "src/main.jsx", "complexity": "medium"}
DEFAULT_HTML   = {"folders": ["css", "js"], "files": ["index.html", "css/style.css", "js/main.js"], "entry": "index.html", "complexity": "low"}


# ── Feature engineering ───────────────────────────────────────────────────────
def encode_input(project_type: str, intent: str) -> np.ndarray:
    """One-hot encode project_type + intent into a flat feature vector."""
    pt_vec  = [1.0 if project_type == p else 0.0 for p in PROJECT_TYPES]
    int_vec = [1.0 if intent == i else 0.0 for i in INTENT_LIST]
    return np.array([pt_vec + int_vec], dtype=np.float32)


def build_ann_model():
    """Build and train the ANN Multi-Layer Perceptron."""
    input_dim  = len(PROJECT_TYPES) + len(INTENT_LIST)  # 12 features
    output_dim = len(STRUCTURE_TEMPLATES)                # one per template

    # ── Synthetic training data ───────────────────────────────────────────────
    X, y = [], []
    labels = list(STRUCTURE_TEMPLATES.keys())
    for idx, (pt, intent) in enumerate(labels):
        vec = encode_input(pt, intent)
        X.append(vec[0])
        y.append(idx)

    # Augment with noise for robustness
    for _ in range(20):
        for idx, (pt, intent) in enumerate(labels):
            vec = encode_input(pt, intent)[0] + np.random.normal(0, 0.05, input_dim)
            X.append(np.clip(vec, 0, 1))
            y.append(idx)

    X = np.array(X, dtype=np.float32)
    y = np.array(y)

    # ── ANN Architecture ─────────────────────────────────────────────────────
    model = Sequential([
        Dense(64,  activation="relu", input_shape=(input_dim,)),
        BatchNormalization(),
        Dropout(0.2),
        Dense(128, activation="relu"),          # Hidden layer 1
        BatchNormalization(),
        Dropout(0.3),
        Dense(64,  activation="relu"),          # Hidden layer 2
        Dropout(0.2),
        Dense(output_dim, activation="softmax"),# Output layer
    ])

    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(X, y, epochs=150, verbose=0)
    return model, labels


# Global instances
_ann_model  = None
_ann_labels = None


def get_structure_model():
    global _ann_model, _ann_labels
    if _ann_model is None:
        print("⏳ ANN: Training code structure predictor...")
        _ann_model, _ann_labels = build_ann_model()
        print("✅ ANN: Structure predictor ready")
    return _ann_model, _ann_labels


def predict_structure(project_type: str, intent: str) -> dict:
    """
    Predict the ideal code file structure using the ANN MLP.
    Returns folder list, file list, entry point, and complexity rating.
    """
    try:
        model, labels = get_structure_model()

        features   = encode_input(project_type, intent)
        preds      = model.predict(features, verbose=0)[0]
        top_idx    = int(np.argmax(preds))
        confidence = float(preds[top_idx])

        # Look up template from structure
        key      = labels[top_idx]
        template = STRUCTURE_TEMPLATES.get(key) or STRUCTURE_TEMPLATES.get(
            (project_type, intent)
        )

        # Fallback if template not found
        if not template:
            template = DEFAULT_REACT if project_type == "react" else DEFAULT_HTML

        return {
            "model":        "ANN (Multi-Layer Perceptron / Feedforward NN)",
            "project_type": project_type,
            "intent":       intent,
            "confidence":   round(confidence, 4),
            "structure": {
                "folders":    template["folders"],
                "files":      template["files"],
                "entry_point": template["entry"],
                "complexity": template["complexity"],
            },
            "description":  f"The ANN predicted a '{template['complexity']}' complexity {project_type} project structure with {len(template['files'])} files.",
        }

    except Exception as e:
        return {
            "model":        "ANN (Multi-Layer Perceptron)",
            "project_type": project_type,
            "intent":       intent,
            "confidence":   0.0,
            "structure":    {},
            "description":  f"ANN structure prediction error: {str(e)}",
            "error":        str(e),
        }
