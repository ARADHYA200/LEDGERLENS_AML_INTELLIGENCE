"""
Fraud Detection Service
Core business logic for AML fraud detection using graph-based and ML techniques.
"""

from typing import List, Dict, Any
import pandas as pd
from utils.fraud_engine import analyze_transactions as analyze_fraud
from routes.transactions import update_transaction_store
from routes.alerts import update_alert_store

def analyze_transactions(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Main fraud analysis function.

    Implements comprehensive AML detection using:
    1. Graph-based detection (cycles, layering, mule accounts)
    2. ML-based anomaly detection (Isolation Forest)
    3. Risk scoring system combining multiple factors

    Args:
        transactions: List of transaction dictionaries with sender, receiver, amount, timestamp

    Returns:
        Analysis results including metrics, alerts, graph data, and summaries
    """
    try:
        # Convert to DataFrame for processing
        df = pd.DataFrame(transactions)

        # Perform fraud analysis
        analysis_result = analyze_fraud(df)

        # Update in-memory stores for API access
        update_transaction_store(transactions, analysis_result)
        update_alert_store(analysis_result.get('alerts', []))

        return analysis_result

    except Exception as e:
        raise Exception(f"Fraud analysis failed: {str(e)}")

def get_fraud_metrics(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Extract key fraud detection metrics"""
    if not transactions:
        return {
            "total_transactions": 0,
            "total_accounts": 0,
            "high_risk_alerts": 0,
            "fraud_patterns_detected": 0
        }

    df = pd.DataFrame(transactions)
    accounts = set(df['sender']).union(set(df['receiver']))

    # This would be enhanced with actual analysis
    return {
        "total_transactions": len(df),
        "total_accounts": len(accounts),
        "high_risk_alerts": 0,  # Would be calculated
        "fraud_patterns_detected": 0  # Would be calculated
    }