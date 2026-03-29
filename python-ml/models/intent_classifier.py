"""
Model 2: LSTM + ANN Text Intent Classifier
Architecture: Embedding → Bidirectional LSTM → Dense (ANN) layers
Task: Classify user text prompts to detect intent — what type of UI to build
      and which UI components are likely needed
"""

import numpy as np
import re
import json
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Embedding, Bidirectional, LSTM, Dense, Dropout, GlobalMaxPooling1D
)
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

# ── Intent categories ─────────────────────────────────────────────────────────
INTENTS = [
    "build_landing_page",
    "build_dashboard",
    "build_auth_page",
    "build_ecommerce",
    "build_portfolio",
    "build_blog",
    "build_settings",
    "update_style",
    "add_component",
    "fix_bug",
]

# ── Synthetic training data ───────────────────────────────────────────────────
TRAINING_DATA = [
    # landing page
    ("build a landing page for my startup", "build_landing_page"),
    ("create a hero section with CTA button", "build_landing_page"),
    ("make a modern landing page with features section", "build_landing_page"),
    ("create a homepage with navbar and footer", "build_landing_page"),
    ("design a product landing page", "build_landing_page"),
    ("build a SaaS landing page", "build_landing_page"),
    ("make a one page website", "build_landing_page"),
    # dashboard
    ("build an analytics dashboard", "build_dashboard"),
    ("create a dashboard with charts and stats", "build_dashboard"),
    ("make an admin panel with sidebar", "build_dashboard"),
    ("design a data visualization dashboard", "build_dashboard"),
    ("create a management dashboard", "build_dashboard"),
    ("build a monitoring dashboard with metrics", "build_dashboard"),
    # auth
    ("create a login page", "build_auth_page"),
    ("build a sign in and register form", "build_auth_page"),
    ("make an authentication page with email and password", "build_auth_page"),
    ("design a login card with validation", "build_auth_page"),
    ("create a signup form", "build_auth_page"),
    # ecommerce
    ("build an ecommerce website", "build_ecommerce"),
    ("create a product listing page with cart", "build_ecommerce"),
    ("make an online store with shopping cart", "build_ecommerce"),
    ("build a product page with add to cart button", "build_ecommerce"),
    ("design a shop page with product cards", "build_ecommerce"),
    # portfolio
    ("create a personal portfolio website", "build_portfolio"),
    ("build a developer portfolio with projects section", "build_portfolio"),
    ("make a portfolio with skills and contact form", "build_portfolio"),
    ("design a creative portfolio page", "build_portfolio"),
    # blog
    ("create a blog page with articles", "build_blog"),
    ("build a news website with posts", "build_blog"),
    ("make a blog with categories and tags", "build_blog"),
    ("design an article listing page", "build_blog"),
    # settings
    ("build a settings page", "build_settings"),
    ("create user preferences panel", "build_settings"),
    ("make account settings with toggle switches", "build_settings"),
    # update style
    ("make the UI more modern", "update_style"),
    ("update the color scheme to dark mode", "update_style"),
    ("make the design more attractive and interactive", "update_style"),
    ("change the font and spacing", "update_style"),
    ("improve the overall styling", "update_style"),
    # add component
    ("add a navbar to the page", "add_component"),
    ("add a contact form", "add_component"),
    ("add a footer section", "add_component"),
    ("add a testimonials section", "add_component"),
    ("add a modal dialog", "add_component"),
    # fix
    ("fix the button alignment", "fix_bug"),
    ("the layout is broken on mobile", "fix_bug"),
    ("fix the CSS styling issue", "fix_bug"),
    ("the component is not rendering correctly", "fix_bug"),
]

# ── Components suggested per intent ──────────────────────────────────────────
INTENT_COMPONENTS = {
    "build_landing_page":   ["Navbar", "HeroSection", "Features", "CTA", "Testimonials", "Footer"],
    "build_dashboard":      ["Sidebar", "TopBar", "StatCard", "LineChart", "BarChart", "DataTable"],
    "build_auth_page":      ["AuthCard", "EmailInput", "PasswordInput", "SubmitButton", "SocialLogin"],
    "build_ecommerce":      ["Navbar", "ProductGrid", "ProductCard", "CartDrawer", "CheckoutForm", "Footer"],
    "build_portfolio":      ["HeroSection", "AboutSection", "ProjectGrid", "SkillBadges", "ContactForm", "Footer"],
    "build_blog":           ["Navbar", "ArticleList", "ArticleCard", "CategoryFilter", "Sidebar", "Footer"],
    "build_settings":       ["SettingsSidebar", "ProfileForm", "ToggleSwitch", "ThemePicker", "SaveButton"],
    "update_style":         ["GlobalCSS", "ThemeConfig", "ColorPalette", "Typography"],
    "add_component":        ["ComponentFile", "StyleFile"],
    "fix_bug":              ["TargetComponent", "StyleFix"],
}

# ── Model vocab / sequence config ─────────────────────────────────────────────
MAX_WORDS   = 2000
MAX_SEQ_LEN = 20


def build_tokenizer_and_model():
    """Train tokenizer + build and train the LSTM/ANN model on synthetic data."""
    texts  = [t for t, _ in TRAINING_DATA]
    labels = [INTENTS.index(l)  for _, l in TRAINING_DATA]

    # ── Tokenizer (vocabulary layer) ─────────────────────────────────────────
    tokenizer = Tokenizer(num_words=MAX_WORDS, oov_token="<OOV>")
    tokenizer.fit_on_texts(texts)

    sequences  = tokenizer.texts_to_sequences(texts)
    padded     = pad_sequences(sequences, maxlen=MAX_SEQ_LEN, padding="post")
    label_arr  = np.array(labels)

    # ── LSTM + ANN model ─────────────────────────────────────────────────────
    model = Sequential([
        Embedding(input_dim=MAX_WORDS, output_dim=64, input_length=MAX_SEQ_LEN),
        Bidirectional(LSTM(64, return_sequences=True)),
        Bidirectional(LSTM(32)),
        Dense(128, activation="relu"),          # ANN dense layer 1
        Dropout(0.4),
        Dense(64, activation="relu"),           # ANN dense layer 2
        Dropout(0.3),
        Dense(len(INTENTS), activation="softmax"),  # Output layer
    ])

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    model.fit(padded, label_arr, epochs=80, verbose=0)
    return tokenizer, model


# Global instances
_tokenizer = None
_lstm_model = None


def get_intent_model():
    global _tokenizer, _lstm_model
    if _lstm_model is None:
        print("⏳ LSTM: Training intent classifier...")
        _tokenizer, _lstm_model = build_tokenizer_and_model()
        print("✅ LSTM: Intent classifier ready")
    return _tokenizer, _lstm_model


def preprocess_text(text: str) -> str:
    """Basic text normalisation."""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    return text


def classify_intent(prompt: str) -> dict:
    """
    Classify a text prompt using the Bidirectional LSTM + ANN model.
    Returns the predicted intent, confidence, and suggested components.
    """
    try:
        tokenizer, model = get_intent_model()
        clean = preprocess_text(prompt)
        seq   = tokenizer.texts_to_sequences([clean])
        pad   = pad_sequences(seq, maxlen=MAX_SEQ_LEN, padding="post")

        preds      = model.predict(pad, verbose=0)[0]
        top_idx    = int(np.argmax(preds))
        confidence = float(preds[top_idx])
        intent     = INTENTS[top_idx]

        ranked = sorted(
            [{"intent": INTENTS[i], "score": round(float(preds[i]), 4)} for i in range(len(INTENTS))],
            key=lambda x: x["score"], reverse=True
        )[:4]

        return {
            "model":               "LSTM + ANN (Bidirectional LSTM)",
            "predicted_intent":    intent,
            "confidence":          round(confidence, 4),
            "all_predictions":     ranked,
            "suggested_components": INTENT_COMPONENTS.get(intent, []),
            "description":         f"The LSTM model detected the intent as '{intent}' with {round(confidence*100,1)}% confidence.",
        }

    except Exception as e:
        return {
            "model":               "LSTM + ANN (Bidirectional LSTM)",
            "predicted_intent":    "unknown",
            "confidence":          0.0,
            "suggested_components": [],
            "description":         f"LSTM classification error: {str(e)}",
            "error":               str(e),
        }
