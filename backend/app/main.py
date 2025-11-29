from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import reviews, webhooks, test_review, auth, embeddings

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CodeAssure API",
    description="AI-powered code review assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["webhooks"])
app.include_router(test_review.router, prefix="/api/test", tags=["testing"])
app.include_router(embeddings.router, prefix="/api/embeddings", tags=["embeddings"])  # NEW

@app.get("/")
def root():
    return {
        "status": "running",
        "app": "CodeAssure",
        "message": "AI Code Review Assistant",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "app": "CodeAssure"}