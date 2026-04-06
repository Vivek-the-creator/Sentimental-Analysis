import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
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


@app.get("/", tags=["Health"])
def root():
    return {"message": "GovSentinel API is running", "version": "1.0.0", "docs": "/docs"}
