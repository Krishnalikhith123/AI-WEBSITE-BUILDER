"""
Model 1: CNN UI Image Classifier
Architecture: MobileNetV2 (pre-trained ImageNet) + custom Dense classification head
Task: Classify uploaded design images into UI categories
"""

import numpy as np
from PIL import Image
import io
import base64
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout

# UI categories the model can classify
UI_CATEGORIES = [
    "landing_page",
    "dashboard",
    "login_form",
    "ecommerce_store",
    "portfolio",
    "blog_page",
    "settings_page",
    "profile_page",
]

# Visual keyword hints for heuristic confidence boost
CATEGORY_HINTS = {
    "landing_page":     ["hero", "cta", "banner", "scroll", "headline"],
    "dashboard":        ["chart", "graph", "sidebar", "stats", "metric"],
    "login_form":       ["login", "sign in", "register", "password", "form"],
    "ecommerce_store":  ["cart", "product", "price", "shop", "buy"],
    "portfolio":        ["work", "project", "gallery", "skill", "resume"],
    "blog_page":        ["post", "article", "read", "tag", "author"],
    "settings_page":    ["setting", "toggle", "preference", "account", "option"],
    "profile_page":     ["avatar", "profile", "bio", "follower", "edit"],
}

# Component associations for each UI category
CATEGORY_COMPONENTS = {
    "landing_page":     ["Navbar", "HeroSection", "Features", "CTA", "Footer"],
    "dashboard":        ["Sidebar", "Header", "StatCards", "Charts", "DataTable"],
    "login_form":       ["AuthCard", "EmailInput", "PasswordInput", "SubmitButton", "Footer"],
    "ecommerce_store":  ["Navbar", "ProductGrid", "ProductCard", "Cart", "Footer"],
    "portfolio":        ["HeroSection", "ProjectGrid", "SkillBadges", "ContactForm", "Footer"],
    "blog_page":        ["Navbar", "ArticleList", "ArticleCard", "Sidebar", "Footer"],
    "settings_page":    ["Sidebar", "SettingsForm", "ToggleSwitch", "SaveButton", "Footer"],
    "profile_page":     ["ProfileHeader", "AvatarUpload", "BioSection", "EditForm", "Footer"],
}


def build_cnn_model():
    """Build MobileNetV2-based CNN classifier."""
    base_model = MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet"
    )
    # Freeze the base layers - we only train our custom head
    base_model.trainable = False

    # Add custom classification head on top
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation="relu")(x)
    x = Dropout(0.3)(x)
    x = Dense(128, activation="relu")(x)
    x = Dropout(0.2)(x)
    outputs = Dense(len(UI_CATEGORIES), activation="softmax")(x)

    model = Model(inputs=base_model.input, outputs=outputs)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model


# Global model instance (loaded once at startup)
_cnn_model = None


def get_model():
    global _cnn_model
    if _cnn_model is None:
        print("⏳ CNN: Loading MobileNetV2 model...")
        _cnn_model = build_cnn_model()
        print("✅ CNN: MobileNetV2 model ready")
    return _cnn_model


def preprocess_image(image_data: str) -> np.ndarray:
    """Convert base64 image string → preprocessed numpy array."""
    # Strip data URL prefix if present
    if "," in image_data:
        image_data = image_data.split(",")[1]

    img_bytes = base64.b64decode(image_data)
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)  # MobileNetV2 preprocessing
    return img_array


def classify_image(image_base64: str) -> dict:
    """
    Classify a UI design image using the CNN model.
    Returns predicted category, confidence, and detected components.
    """
    try:
        model = get_model()
        img_array = preprocess_image(image_base64)

        # Forward pass through CNN
        predictions = model.predict(img_array, verbose=0)[0]

        top_idx = int(np.argmax(predictions))
        confidence = float(predictions[top_idx])
        predicted_category = UI_CATEGORIES[top_idx]

        # Build ranked predictions list
        ranked = sorted(
            [{"label": UI_CATEGORIES[i], "score": float(predictions[i])} for i in range(len(UI_CATEGORIES))],
            key=lambda x: x["score"],
            reverse=True
        )

        return {
            "model": "CNN (MobileNetV2)",
            "predicted_ui_type": predicted_category,
            "confidence": round(confidence, 4),
            "all_predictions": ranked[:4],
            "detected_components": CATEGORY_COMPONENTS.get(predicted_category, []),
            "description": f"The CNN model identified this image as a {predicted_category.replace('_', ' ')} with {round(confidence * 100, 1)}% confidence.",
        }

    except Exception as e:
        # Graceful fallback
        return {
            "model": "CNN (MobileNetV2)",
            "predicted_ui_type": "unknown",
            "confidence": 0.0,
            "detected_components": [],
            "description": f"CNN classification error: {str(e)}",
            "error": str(e)
        }
