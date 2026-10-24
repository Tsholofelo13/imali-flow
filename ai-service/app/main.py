import io
import json
import os
import secrets

import anthropic
import pytesseract
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from PIL import Image
from pydantic import BaseModel, Field

from .forecast import runway
from .prompts import LANGUAGE_NAMES, SYSTEM_PROMPT

app = FastAPI(title="Imali Flow AI service", docs_url=None, redoc_url=None)

INTERNAL_KEY = os.environ.get("AI_INTERNAL_KEY", "")
MODEL = os.environ.get("AI_MODEL", "claude-sonnet-4-6")
MAX_IMAGE_BYTES = 5 * 1024 * 1024
_client = None


def client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env
    return _client


def require_internal_key(x_internal_key: str = Header(default="")):
    if not INTERNAL_KEY or not secrets.compare_digest(x_internal_key, INTERNAL_KEY):
        raise HTTPException(status_code=401, detail="unauthorized")


class TextIn(BaseModel):
    text: str = Field(min_length=1, max_length=8000)
    language: str = "en"


class ForecastIn(BaseModel):
    balance: float
    daily_spend_history: list[float] = []
    income_events: list[dict] = []


def analyse(text: str, language: str) -> dict:
    lang = LANGUAGE_NAMES.get(language, "English")
    msg = client().messages.create(
        model=MODEL,
        max_tokens=1200,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": f"Respond in {lang}.\n<document>\n{text}\n</document>"}],
    )
    raw = "".join(b.text for b in msg.content if b.type == "text").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Model output is untrusted: never pass through unparsed text
        return {"document_type": "other",
                "summary": "We could not analyse this reliably. Please try a clearer photo.",
                "red_flags": [], "scam_likelihood": "medium",
                "advice": ["Do not pay anything upfront."]}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze/text", dependencies=[Depends(require_internal_key)])
def analyze_text(body: TextIn):
    if not os.environ.get("ANTHROPIC_API_KEY"):
        # No AI key configured: the backend falls back to its own rule-based checks.
        raise HTTPException(status_code=503, detail="ai not configured")
    return analyse(body.text, body.language)


@app.post("/analyze/image", dependencies=[Depends(require_internal_key)])
async def analyze_image(file: UploadFile = File(...), language: str = Form("en")):
    data = await file.read()
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="file too large")
    try:
        Image.open(io.BytesIO(data)).verify()  # reject disguised/corrupt files
        img = Image.open(io.BytesIO(data)).convert("L")
    except Exception:
        raise HTTPException(status_code=415, detail="not a valid image")
    text = pytesseract.image_to_string(img, lang="eng").strip()
    if not text:
        raise HTTPException(status_code=422, detail="no readable text found")
    if not os.environ.get("ANTHROPIC_API_KEY"):
        # No AI key configured: return only the text read from the photo.
        # The backend then runs its own rule-based checks on that text.
        return {"extracted_text": text, "ai_available": False}
    return {"extracted_text": text, **analyse(text, language)}


@app.post("/forecast/runway", dependencies=[Depends(require_internal_key)])
def forecast_runway(body: ForecastIn):
    return runway(body.balance, body.daily_spend_history, body.income_events)