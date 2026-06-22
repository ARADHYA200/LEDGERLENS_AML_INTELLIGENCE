"""
Insights Routes
Provides AI-generated insights for AML analysis.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import os
from services.insights_service import generate_insights

router = APIRouter()

@router.get("/")
async def get_insights():
    """
    Generate AI-powered insights from transaction analysis.

    Returns smart insights about fraud patterns, trends, and recommendations.
    """
    try:
        # Get current analysis data (in production, this would come from database)
        # For now, return sample insights
        insights = generate_insights()

        return {
            "insights": insights,
            "generated_at": "2024-01-01T00:00:00Z",  # Would be current timestamp
            "model_version": "1.0"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")

@router.post("/regenerate")
async def regenerate_insights():
    """Regenerate insights with latest data"""
    try:
        insights = generate_insights()
        return {
            "insights": insights,
            "message": "Insights regenerated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to regenerate insights: {str(e)}")