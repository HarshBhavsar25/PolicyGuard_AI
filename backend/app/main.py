from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import router as api_router

app = FastAPI(
    title="PolicyGuard AI API",
    description="Backend API for the PolicyGuard AI Data Compliance Agent.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to the PolicyGuard AI API"}
