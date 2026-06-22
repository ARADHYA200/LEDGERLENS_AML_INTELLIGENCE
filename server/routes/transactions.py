"""
Transactions Routes
Handles retrieval and management of transaction data.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import pandas as pd

router = APIRouter()

# In-memory storage for demo - in production, use database
_transaction_store: List[Dict[str, Any]] = []

class TransactionResponse(BaseModel):
    id: int
    sender: str
    receiver: str
    amount: float
    timestamp: str
    risk_score: Optional[float] = None
    suspicious: bool = False

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=1000, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in sender/receiver"),
    sort_by: str = Query("timestamp", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    suspicious_only: bool = Query(False, description="Show only suspicious transactions")
):
    """
    Retrieve paginated transaction data with filtering and sorting.

    Features:
    - Pagination
    - Search by sender/receiver
    - Sorting by any field
    - Filter suspicious transactions
    """
    if not _transaction_store:
        return []

    try:
        # Convert to DataFrame for easier manipulation
        df = pd.DataFrame(_transaction_store)

        # Apply filters
        if search:
            df = df[
                df['sender'].str.contains(search, case=False, na=False) |
                df['receiver'].str.contains(search, case=False, na=False)
            ]

        if suspicious_only:
            df = df[df['suspicious'] == True]

        # Sort
        if sort_by in df.columns:
            ascending = sort_order.lower() == 'asc'
            df = df.sort_values(sort_by, ascending=ascending)

        # Paginate
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_df = df.iloc[start_idx:end_idx]

        # Convert back to list
        transactions = paginated_df.to_dict('records')

        return transactions

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve transactions: {str(e)}")

@router.get("/stats")
async def get_transaction_stats():
    """Get transaction statistics"""
    if not _transaction_store:
        return {
            "total_transactions": 0,
            "total_amount": 0,
            "avg_amount": 0,
            "suspicious_count": 0
        }

    df = pd.DataFrame(_transaction_store)
    return {
        "total_transactions": len(df),
        "total_amount": df['amount'].sum(),
        "avg_amount": df['amount'].mean(),
        "suspicious_count": df['suspicious'].sum()
    }

# Function to update transaction store (called from upload)
def update_transaction_store(transactions: List[Dict[str, Any]], analysis_result: Dict[str, Any]):
    """Update the in-memory transaction store with analysis results"""
    global _transaction_store

    # Create account risk mapping
    account_risks = {}
    for summary in analysis_result.get('account_summaries', []):
        account_risks[summary['account']] = {
            'risk_score': summary['risk_score'],
            'risk_level': summary['risk_level']
        }

    # Update transactions with risk info
    updated_transactions = []
    for i, txn in enumerate(transactions):
        risk_info = account_risks.get(txn['sender'], {}) or account_risks.get(txn['receiver'], {})
        updated_transactions.append({
            'id': i + 1,
            'sender': txn['sender'],
            'receiver': txn['receiver'],
            'amount': txn['amount'],
            'timestamp': txn['timestamp'].isoformat() if hasattr(txn['timestamp'], 'isoformat') else str(txn['timestamp']),
            'risk_score': risk_info.get('risk_score'),
            'suspicious': risk_info.get('risk_level') == 'high'
        })

    _transaction_store = updated_transactions