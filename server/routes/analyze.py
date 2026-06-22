"""
Analyze Routes
Provides endpoints for fraud analysis operations.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
from services.fraud_service import analyze_transactions

router = APIRouter()

class Transaction(BaseModel):
    sender: str
    receiver: str
    amount: float
    timestamp: str  # ISO format

class AnalyzeRequest(BaseModel):
    transactions: List[Transaction]

@router.post("/")
async def analyze_transaction_data(request: AnalyzeRequest):
    """
    Analyze transaction data for AML fraud patterns.

    Accepts a list of transactions and returns comprehensive fraud analysis
    including graph-based detection, ML anomaly scoring, and risk assessment.
    """
    try:
        # Convert to internal format
        transactions = []
        for txn in request.transactions:
            transactions.append({
                "sender": txn.sender,
                "receiver": txn.receiver,
                "amount": txn.amount,
                "timestamp": pd.to_datetime(txn.timestamp)
            })

        if not transactions:
            raise HTTPException(status_code=400, detail="No transactions provided")

        # Perform analysis
        result = analyze_transactions(transactions)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/health")
async def analysis_health():
    """Health check for analysis service"""
    return {"status": "healthy", "service": "fraud_analysis"}