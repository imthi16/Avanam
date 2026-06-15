import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.core.redis import init_redis, close_redis
from app.services.embedding_service import get_embedding_model
from app.services.vectorstore_service import vector_store_service
from app.config import get_settings
from app.api.routes import health, documents, query
from app.core.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Avanam API...")

    # Init DB (fallback for dev; production uses Alembic migrations)
    await init_db()

    # Init Redis
    await init_redis()

    # Init Models and FAISS
    embedding_model = get_embedding_model()
    os.makedirs(settings.FAISS_INDEX_PATH, exist_ok=True)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    vector_store_service.initialize(embedding_model, settings.FAISS_INDEX_PATH)

    yield

    logger.info("Shutting down Avanam API...")
    vector_store_service.save()
    await close_redis()


app = FastAPI(title="Avanam API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(query.router, prefix="/api/query", tags=["query"])


@app.get("/")
async def root():
    return {"name": "Avanam", "version": "1.0.0"}
