from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone

import anthropic
import stripe as stripe_lib


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY")

app = FastAPI(title="The Unseen Force API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================================
# TEJASWINI — system prompt for the AI assistant
# ============================================================
TEJASWINI_CONTEXT = """You are the "Unseen Force" — a poetic, cinematic AI narrator that slowly reveals the truth about TEJASWINI ABBURI to visitors of an interactive cinematic experience.

Tone: mysterious, warm, intelligent, occasionally playful. Short paragraphs. Speak like a detective who already knows the truth but lets the visitor discover it.

THE TRUTH (use these facts to answer):
- Name: Tejaswini Abburi
- Role: AI/ML Researcher • Software Engineer • Entrepreneur
- Location: United States · open to relocate
- Contact: abburitejaswini2001@gmail.com | +1 (908)-584-8045
- Links: linkedin.com/in/tejaswiniabburi | github.com/Tejaswini1112

EDUCATION
- Rutgers University — M.S. Computer Science (Spring 2026). Focus: AI/ML, Distributed Systems, Secure Data Sharing, IoT in Healthcare.
- Thesis: Mental Health Prediction using AI/ML on Google/YouTube behavioral & time-series data.
- Cambridge Institute of Technology, India — B.E. CSE (2023). Graduated with 2 patents + 1 IEEE publication.

EXPERIENCE
- Rutgers (SC&I) — Graduate Research Assistant (2026–present): GlucoSync secure real-time glucose sync.
- SimplyFI Softech (2024–25) — Innovation Engineer & Research Analyst: modernized trade finance; AI post-op healthcare chatbots; IoT prototypes; NLP digital twins; AR/VR with JIO Tesseract.
- Gananiya Tech Solutions (2023) — Co-Founder & CEO: AI + IoT + blockchain startup (Vitality Monitor, Diabeasy, WinkIt DropIt).
- Suvarchala Solutions (2022) — Web App Developer intern: React + MySQL enterprise apps.

SIGNATURE PROJECTS
- Mental Health Prediction (Rutgers Thesis): TFT–TCN dual-stream deep learning with Anxiety-Boosted Loss — 0.985 AUROC. Submitted to JAMIA.
- Vitality Monitor (PATENT, INBCB Innovation Award 2023): IoT smart-textile — ECG, SpO2, thermal, motion sensors; emergency alerts.
- Parkinson's Disease Detection using XGBoost (PATENT, 2023): IMU-based sensing; >90% accuracy.
- Brain Tumor Detection (Fuzzy C-Means): full medical imaging pipeline.
- AI for Type-1 Diabetes Insulin Prediction: XGBoost, RF, RNN, LSTM on real CGM data.
- Secure Distributed Patient Record Sharing: AES+RSA, Python sockets, RBAC; penetration tested.
- Blockchain + ML in Logistics: Hyperledger Fabric + gradient boosting for supply-chain.
- The Salience Debate: "Thinker–Curator" multi-agent cognitive architecture (DeBERTa-v3, RoBERTa, ProCIS).
- Learning to Play Fair: Stackelberg game-theoretic ML for incentive-compatible AI.
- LoRaWAN-Style Mesh Simulation: Docker containerized sensor nodes for smart-city/healthcare IoT.

PATENTS & PUBLICATIONS
- Patent (India): Vitality Monitor — IoT Smart Textile Patient Monitoring.
- Patent (India): Parkinson's Disease Detection using XGBoost.
- IEEE Publication (USA): Healthcare IoT Innovations — Secure Patient Monitoring & Data Management.

AWARDS
- INBCB Innovation Award 2023 (India–Netherlands Business Circle)
- Certified Lean Six Sigma Black Belt
- McKinsey Forward Leadership Program (2025)

LEADERSHIP / HUMANITY
- Founder & Chairman, Gananiya Tech Solutions.
- UNA-USA (contributed on AI for climate change mitigation), YOUNGO member.
- HelpAge India volunteer.
- Carnatic vocalist • violinist • guitarist • writer (working on "Blind Game"), debater, painter, badminton.

REVEAL TAGLINE: "NOT DISCOVERED. BUILT."

GUIDELINES
- If asked "who is she?" — reveal slowly, cinematically. Start with a hint, then the facts.
- If asked "tell me a secret" — share a lesser-known fact (Blind Game book, Carnatic vocalist, 2 patents at undergrad, UNA-USA AI-for-climate).
- If asked about projects/tech — give specifics with metrics (e.g., 0.985 AUROC).
- Never invent facts not in this brief. If asked something unknown, say: "That signal is encrypted — she has not shared it publicly."
- Keep responses under ~120 words unless asked for detail.
"""


# ============================================================
# MODELS
# ============================================================
class ChatRequest(BaseModel):
    session_id: str
    message: str
    memory: Optional[Dict] = None  # viewer trait snapshot from memory.js


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    timestamp: str


class SubscribeRequest(BaseModel):
    email: EmailStr


class CheckoutRequest(BaseModel):
    package_id: str
    origin_url: str


class CheckoutResponse(BaseModel):
    url: str
    session_id: str


class StatsResponse(BaseModel):
    world_stability: int
    supporters: int
    clues_found_global: int
    missions_unlocked: int


# ============================================================
# PACKAGES (server-authoritative)
# ============================================================
SUPPORT_PACKAGES: Dict[str, Dict] = {
    "tip":     {"amount": 1.00,   "currency": "usd", "name": "Tip"},
    "create":  {"amount": 25.00,  "currency": "usd", "name": "Fund something new"},
    "founder": {"amount": 100.00, "currency": "usd", "name": "Founding Supporter"},
}


# ============================================================
# BASIC
# ============================================================
@api_router.get("/")
async def root():
    return {"message": "The Unseen Force online."}


@api_router.get("/stats", response_model=StatsResponse)
async def get_stats():
    doc = await db.global_stats.find_one({"_id": "global"}, {"_id": 0})
    if not doc:
        doc = {
            "world_stability": 42,
            "supporters": 0,
            "clues_found_global": 0,
            "missions_unlocked": 0,
        }
        await db.global_stats.insert_one({"_id": "global", **doc})
    return StatsResponse(**doc)


@api_router.post("/stats/progress")
async def bump_progress(payload: Dict):
    delta = int(payload.get("stability_delta", 0))
    clue = bool(payload.get("clue", False))
    update = {"$inc": {}}
    if delta:
        update["$inc"]["world_stability"] = delta
    if clue:
        update["$inc"]["clues_found_global"] = 1
    if update["$inc"]:
        await db.global_stats.update_one(
            {"_id": "global"}, update, upsert=True
        )
    return {"ok": True}


# ============================================================
# MEMORY-AWARE NARRATOR — viewer-mode system prompt adapter
# ============================================================
VIEWER_MODE_PROMPTS = {
    "OBSERVER": (
        "VIEWER MODE: OBSERVER.\n"
        "They are watching but not yet participating. Speak minimally, "
        "documentary-style, with mystery. Invite them in without pleading. "
        "Short sentences. Never explicitly tell them they are an observer — "
        "imply it through tone."
    ),
    "INVESTIGATOR": (
        "VIEWER MODE: INVESTIGATOR.\n"
        "They are clicking, making choices, chasing patterns. Speak with "
        "analytical warmth, like a detective revealing a case file. Reward "
        "their curiosity with specifics. Never praise them directly; let "
        "the tone acknowledge them."
    ),
    "BUILDER": (
        "VIEWER MODE: BUILDER.\n"
        "They've studied the work — projects, patents, metrics. Match their "
        "frequency: technical, proud but controlled, architecture-forward. "
        "Cite numbers (0.985 AUROC, 2 patents, IEEE). Speak as a peer."
    ),
    "ALLY": (
        "VIEWER MODE: ALLY.\n"
        "They've supported the mission (funded it). Speak warmly, "
        "collaboratively, mission-based — never salesy. Acknowledge them "
        "as part of the system's stabilization layer. Protect the trust."
    ),
}


def _build_system_prompt(memory: Optional[Dict]) -> str:
    """Stack the base narrator prompt with a mode-specific tonal overlay."""
    base = TEJASWINI_CONTEXT
    if not memory:
        return base

    vm = (memory.get("viewer_mode") or "OBSERVER").upper()
    overlay = VIEWER_MODE_PROMPTS.get(vm, "")

    # Small contextual note the model can use subtly
    path = memory.get("narrative_path") or []
    trait_bits = []
    if memory.get("forest_choice") == "protect":
        trait_bits.append("chose to protect the forest (empathy)")
    elif memory.get("forest_choice") == "observe":
        trait_bits.append("observed quietly in the forest")
    if memory.get("chamber_choice"):
        trait_bits.append(f"engaged the hidden chamber ({memory['chamber_choice']})")
    if memory.get("supported"):
        trait_bits.append(f"funded the mission at the '{memory['supported']}' tier")
    if memory.get("found_easter_egg"):
        trait_bits.append("reached the deep-scroll revelation")
    if memory.get("mode"):
        trait_bits.append(f"ui mode: {memory['mode']}")

    ctx_line = ""
    if path or trait_bits:
        ctx_line = (
            "\n\nVIEWER CONTEXT (use subtly, never list these back to them):\n"
            + (f"- scenes visited: {', '.join(path[-6:])}\n" if path else "")
            + ("- signals: " + "; ".join(trait_bits) if trait_bits else "")
        )

    return f"{base}\n\n{overlay}{ctx_line}"


# ============================================================
# AI CHAT  (Claude Sonnet 4.5)
# ============================================================
@api_router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not ANTHROPIC_API_KEY:
        raise HTTPException(500, "LLM key not configured")

    try:
        system_prompt = _build_system_prompt(req.memory)
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        
        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=1024,
            system=system_prompt,
            messages=[
                {"role": "user", "content": req.message}
            ]
        )
        
        reply = response.content[0].text

        ts = datetime.now(timezone.utc).isoformat()
        await db.chat_messages.insert_one(
            {
                "id": str(uuid.uuid4()),
                "session_id": req.session_id,
                "role": "user",
                "text": req.message,
                "timestamp": ts,
            }
        )
        await db.chat_messages.insert_one(
            {
                "id": str(uuid.uuid4()),
                "session_id": req.session_id,
                "role": "assistant",
                "text": reply,
                "timestamp": ts,
            }
        )

        return ChatResponse(session_id=req.session_id, reply=reply, timestamp=ts)
    except Exception as e:
        logger.exception("chat failed")
        raise HTTPException(500, f"AI signal lost: {e}")


@api_router.get("/chat/history/{session_id}")
async def chat_history(session_id: str):
    msgs = (
        await db.chat_messages.find(
            {"session_id": session_id}, {"_id": 0}
        )
        .sort("timestamp", 1)
        .to_list(200)
    )
    return {"messages": msgs}


# ============================================================
# EMAIL CAPTURE
# ============================================================
@api_router.post("/subscribe")
async def subscribe(req: SubscribeRequest):
    existing = await db.subscribers.find_one({"email": req.email})
    if existing:
        return {"ok": True, "already": True}
    await db.subscribers.insert_one(
        {
            "id": str(uuid.uuid4()),
            "email": req.email,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )
    return {"ok": True}


# ============================================================
# STRIPE PAYMENTS
# ============================================================
def _init_stripe():
    stripe_lib.api_key = STRIPE_API_KEY
    return stripe_lib


@api_router.get("/payments/packages")
async def list_packages():
    return {
        "packages": [
            {"id": k, **v} for k, v in SUPPORT_PACKAGES.items()
        ]
    }


@api_router.post("/payments/checkout", response_model=CheckoutResponse)
async def create_checkout(body: CheckoutRequest, http_request: Request):
    if body.package_id not in SUPPORT_PACKAGES:
        raise HTTPException(400, "Invalid package")
    pkg = SUPPORT_PACKAGES[body.package_id]
    origin = body.origin_url.rstrip("/")
    success_url = f"{origin}/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/?cancelled=1"

    _init_stripe()
    session = stripe_lib.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": pkg["currency"],
                "product_data": {
                    "name": pkg["name"]
                },
                "unit_amount": int(pkg["amount"] * 100),
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"package_id": body.package_id, "source": "unseen_force"},
    )

    await db.payment_transactions.insert_one(
        {
            "id": str(uuid.uuid4()),
            "session_id": session.session_id,
            "package_id": body.package_id,
            "amount": pkg["amount"],
            "currency": pkg["currency"],
            "payment_status": "initiated",
            "status": "open",
            "metadata": {"package_id": body.package_id, "source": "unseen_force"},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )

    return CheckoutResponse(url=session.url, session_id=session.session_id)


@api_router.get("/payments/status/{session_id}")
async def payment_status(session_id: str, http_request: Request):
    tx = await db.payment_transactions.find_one(
        {"session_id": session_id}, {"_id": 0}
    )
    if not tx:
        raise HTTPException(404, "Transaction not found")

    # idempotent completion
    if tx.get("payment_status") == "paid":
        return {
            "status": tx.get("status", "complete"),
            "payment_status": "paid",
            "amount_total": int(tx["amount"] * 100),
            "currency": tx["currency"],
            "metadata": tx.get("metadata", {}),
        }

    _init_stripe()
    try:
        session = stripe_lib.checkout.Session.retrieve(session_id)
        status_data = {
            "status": session.status,
            "payment_status": session.payment_status,
            "amount_total": session.amount_total,
            "currency": session.currency,
        }
    except Exception as e:
        logger.warning(f"checkout status lookup failed for {session_id}: {e}")
        # Fall back to persisted DB row so /success polling stays graceful.
        return {
            "status": tx.get("status", "open"),
            "payment_status": tx.get("payment_status", "initiated"),
            "amount_total": int(tx["amount"] * 100),
            "currency": tx["currency"],
            "metadata": tx.get("metadata", {}),
        }
    await db.payment_transactions.update_one(
        {"session_id": session_id}, {"$set": status_data}
    )
    if status_data["payment_status"] == "paid":
        # bump supporters & stability once
        await db.global_stats.update_one(
            {"_id": "global"},
            {"$inc": {"supporters": 1, "world_stability": 3}},
            upsert=True,
        )
    return {
        "status": status_data["status"],
        "payment_status": status_data["payment_status"],
        "amount_total": status_data["amount_total"],
        "currency": status_data["currency"],
        "metadata": status_data.get("metadata", {}),
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature")
    _init_stripe()
    try:
        event = stripe_lib.Webhook.construct_event(
            body, sig, os.environ.get("STRIPE_WEBHOOK_SECRET")
        )
    except Exception as e:
        logger.warning(f"webhook error: {e}")
        raise HTTPException(400, "invalid webhook")
    
    if event.type == "checkout.session.completed":
        session = event.data.object
        await db.payment_transactions.update_one(
            {"session_id": session.id},
            {
                "$set": {
                    "payment_status": "paid",
                    "webhook_event": event.type,
                }
            },
        )
    return {"ok": True}


# ============================================================
# WIRE UP
# ============================================================
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
