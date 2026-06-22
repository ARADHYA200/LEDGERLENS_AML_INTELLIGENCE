"""
LedgerLens AML Analytics Platform - FastAPI Backend
Production-ready AI-powered Anti-Money Laundering analytics platform.

This backend provides REST APIs for:
- CSV upload and validation
- Fraud detection analysis using graph-based and ML techniques
- Transaction data retrieval
- Alert management
- AI-generated insights

Architecture:
- routes/: API endpoints
- services/: Business logic
- models/: Data models
- utils/: Utility functions for fraud detection
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, analyze, transactions, alerts, insights, sample
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="LedgerLens AML API",
    description="AI-powered AML analytics platform",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["Analyze"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])
app.include_router(sample.router, prefix="/api/sample", tags=["Sample"])

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {"message": "LedgerLens AML API Running 🚀", "status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)