"""
Alerts Routes
Manages AML alerts and notifications.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

router = APIRouter()

# In-memory storage for alerts
_alert_store: List[Dict[str, Any]] = []

class AlertResponse(BaseModel):
    id: int
    account: str
    risk_score: float
    risk_level: str
    reasons: List[str]
    timestamp: str

@router.get("/", response_model=List[AlertResponse])
async def get_alerts(
    risk_level: Optional[str] = None,
    limit: int = 100
):
    """
    Retrieve AML alerts with optional filtering.

    Parameters:
    - risk_level: Filter by 'high', 'medium', 'low'
    - limit: Maximum number of alerts to return
    """
    alerts = _alert_store

    if risk_level:
        alerts = [alert for alert in alerts if alert['risk_level'] == risk_level]

    # Sort by risk score descending
    alerts = sorted(alerts, key=lambda x: x['risk_score'], reverse=True)

    return alerts[:limit]

@router.get("/summary")
async def get_alerts_summary():
    """Get alerts summary statistics"""
    if not _alert_store:
        return {
            "total_alerts": 0,
            "high_risk": 0,
            "medium_risk": 0,
            "low_risk": 0
        }

    high = sum(1 for alert in _alert_store if alert['risk_level'] == 'high')
    medium = sum(1 for alert in _alert_store if alert['risk_level'] == 'medium')
    low = sum(1 for alert in _alert_store if alert['risk_level'] == 'low')

    return {
        "total_alerts": len(_alert_store),
        "high_risk": high,
        "medium_risk": medium,
        "low_risk": low
    }

@router.delete("/{alert_id}")
async def dismiss_alert(alert_id: int):
    """Dismiss an alert by ID"""
    global _alert_store
    _alert_store = [alert for alert in _alert_store if alert['id'] != alert_id]
    return {"message": "Alert dismissed"}

# Function to update alert store
def update_alert_store(alerts: List[Dict[str, Any]]):
    """Update the in-memory alert store"""
    global _alert_store
    import datetime

    _alert_store = [
        {
            'id': i + 1,
            'account': alert['account'],
            'risk_score': alert['score'],
            'risk_level': alert['riskLevel'],
            'reasons': alert['reasons'],
            'timestamp': datetime.datetime.now().isoformat()
        }
        for i, alert in enumerate(alerts)
    ]