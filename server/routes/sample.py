"""
Sample Routes
Handles sample dataset loading for demonstration.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import os
from routes.upload import validate_csv_columns, process_csv_dataframe, REQUIRED_COLUMNS
from services.fraud_service import analyze_transactions

router = APIRouter()

@router.get("")
@router.get("/")
async def get_sample_data():
    """Load and analyze sample data"""
    sample_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'sample.csv')
    
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="Sample dataset not found")
        
    try:
        df = pd.read_csv(sample_path)
        
        # Clean column names
        df.columns = df.columns.str.strip().str.lower()
        
        # Validate and drop empties
        validate_csv_columns(df)
        df = df.dropna(subset=REQUIRED_COLUMNS, how='all')
        
        # Process
        transactions = process_csv_dataframe(df)
        
        if not transactions:
            raise HTTPException(status_code=400, detail="No valid transactions found in sample")
            
        # Analyze
        analysis_result = analyze_transactions(transactions)
        
        # Update in-memory stores
        from routes.transactions import update_transaction_store
        from routes.alerts import update_alert_store
        update_transaction_store(transactions, analysis_result)
        update_alert_store(analysis_result.get('alerts', []))
        
        # We augment the response with raw transactions and stats so the frontend can store them easily
        # Ensure timestamp is string for JSON response
        for t in transactions:
            if hasattr(t['timestamp'], 'isoformat'):
                t['timestamp'] = t['timestamp'].isoformat()
            else:
                t['timestamp'] = str(t['timestamp'])

        stats = {
            "total_transactions": len(transactions),
            "total_amount": df['amount'].sum(),
            "avg_amount": df['amount'].mean(),
            "suspicious_count": sum(1 for a in analysis_result.get('account_summaries', []) if a.get('risk_level') == 'high')
        }
        
        return JSONResponse(content={
            "transactions": transactions,
            "stats": stats,
            "analysis": analysis_result
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error during sample processing: {str(e)}")
