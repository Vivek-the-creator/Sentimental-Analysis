import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.db.database import engine
from app.models.models import Base
from app.routes import auth, posts, comments, likes, analytics, predict
from app.services.ml_service import ml_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────────
    logger.info("Creating database tables…")
    Base.metadata.create_all(bind=engine)
    logger.info("Loading BERT sentiment model…")
    ml_service.load_model()
    logger.info("GovSentinel API ready ✓")
    yield
    # ── Shutdown ─────────────────────────────────────────────────────────────
    logger.info("Shutting down…")


app = FastAPI(
    title="GovSentinel API",
    description="AI-Powered Government E-Consultation Sentiment Analysis Platform",
    version="1.0.0",
    lifespan=lifespan,
)

BASE_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIST_DIR = BASE_DIR / "frontend" / "dist"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.ngrok-free\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(likes.router)
app.include_router(analytics.router)
app.include_router(predict.router)


if FRONTEND_DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST_DIR / "assets"), name="assets")


@app.get("/", tags=["Health"])
def root():
    if FRONTEND_DIST_DIR.exists():
        return FileResponse(FRONTEND_DIST_DIR / "index.html")
    return {"message": "GovSentinel API is running", "version": "1.0.0", "docs": "/docs"}


@app.get("/{full_path:path}", include_in_schema=False)
def frontend_app(full_path: str):
    if not FRONTEND_DIST_DIR.exists():
        return {"message": "GovSentinel API is running", "version": "1.0.0", "docs": "/docs"}

    requested_file = FRONTEND_DIST_DIR / full_path
    if full_path and requested_file.exists() and requested_file.is_file():
        return FileResponse(requested_file)

    return FileResponse(FRONTEND_DIST_DIR / "index.html")
