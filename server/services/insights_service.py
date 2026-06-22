"""
Insights Service
Generates AI-powered insights for AML analysis.
"""

from typing import List, Dict, Any
import random
import os
from datetime import datetime

def generate_insights() -> List[Dict[str, Any]]:
    """
    Generate smart insights based on transaction patterns.

    In production, this would analyze actual transaction data and use ML/AI
    to identify patterns, trends, and anomalies.

    For demo purposes, returns sample insights.
    """
    insights = [
        {
            "id": 1,
            "title": "Weekend Fraud Spike Detected",
            "description": "Unusual increase in high-value transactions during weekends. Accounts X123 and Y456 show 300% higher activity.",
            "severity": "high",
            "category": "temporal_pattern",
            "recommendation": "Increase monitoring for weekend transactions over $10,000",
            "icon": "📈"
        },
        {
            "id": 2,
            "title": "Circular Transaction Pattern",
            "description": "Detected money flow cycles between 5 accounts, potentially indicating layering schemes.",
            "severity": "high",
            "category": "graph_pattern",
            "recommendation": "Flag all accounts in cycle C-789 for enhanced due diligence",
            "icon": "🔄"
        },
        {
            "id": 3,
            "title": "New Account Rapid Transactions",
            "description": "Account Z999 (created 2 days ago) processed 50 transactions totaling $250K.",
            "severity": "medium",
            "category": "velocity_anomaly",
            "recommendation": "Review account creation source and transaction velocity limits",
            "icon": "⚡"
        },
        {
            "id": 4,
            "title": "Geographic Anomaly",
            "description": "Transactions from account A111 show unusual geographic spread across 12 countries in 24 hours.",
            "severity": "medium",
            "category": "geographic_pattern",
            "recommendation": "Verify account holder identity and transaction legitimacy",
            "icon": "🌍"
        },
        {
            "id": 5,
            "title": "Mule Account Network",
            "description": "Identified network of 8 accounts receiving from multiple sources and sending to single destination.",
            "severity": "high",
            "category": "network_analysis",
            "recommendation": "Freeze all accounts in network M-456 pending investigation",
            "icon": "🕸️"
        }
    ]

    # In production, would analyze actual data
    # For now, return insights with current timestamp
    current_time = datetime.now().isoformat()

    for insight in insights:
        insight["timestamp"] = current_time
        insight["confidence"] = random.uniform(0.7, 0.95)  # Mock confidence score

    return insights

def get_insights_summary() -> Dict[str, Any]:
    """Get summary of insights"""
    insights = generate_insights()

    severity_counts = {}
    for insight in insights:
        severity = insight["severity"]
        severity_counts[severity] = severity_counts.get(severity, 0) + 1

    return {
        "total_insights": len(insights),
        "severity_breakdown": severity_counts,
        "categories": list(set(insight["category"] for insight in insights)),
        "last_updated": datetime.now().isoformat()
    }