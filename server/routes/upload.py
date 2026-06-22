"""
Upload Routes
Handles CSV file upload, validation, and initial processing.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import io
from typing import List, Dict, Any
from services.fraud_service import analyze_transactions

router = APIRouter()

REQUIRED_COLUMNS = ["sender", "receiver", "amount", "timestamp"]

def validate_csv_columns(df: pd.DataFrame) -> None:
    """Validate that CSV contains required columns"""
    missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"CSV must include columns: {', '.join(REQUIRED_COLUMNS)}. Missing: {', '.join(missing_columns)}"
        )

def parse_amount(value: Any) -> float:
    """Parse amount from various formats"""
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        # Remove currency symbols, commas, spaces
        cleaned = value.replace(',', '').replace('$', '').replace(' ', '').strip()
        try:
            return float(cleaned)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid amount value: {value}")
    raise HTTPException(status_code=400, detail=f"Invalid amount type: {type(value)}")

def parse_timestamp(value: Any) -> pd.Timestamp:
    """Parse timestamp from various formats"""
    try:
        if isinstance(value, (int, float)):
            # Unix timestamp
            return pd.to_datetime(value, unit='ms' if value > 1e10 else 's')
        elif isinstance(value, str):
            return pd.to_datetime(value.strip())
        else:
            return pd.to_datetime(value)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid timestamp value: {value}. Error: {str(e)}")

def process_csv_dataframe(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Process DataFrame into standardized transaction format"""
    transactions = []

    for idx, row in df.iterrows():
        try:
            transaction = {
                "sender": str(row["sender"]).strip(),
                "receiver": str(row["receiver"]).strip(),
                "amount": parse_amount(row["amount"]),
                "timestamp": parse_timestamp(row["timestamp"])
            }
            transactions.append(transaction)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error processing row {idx + 1}: {str(e)}"
            )

    return transactions

@router.post("")
@router.post("/")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload and analyze CSV file for AML fraud detection.

    Expected CSV format:
    - sender: string (account ID)
    - receiver: string (account ID)
    - amount: number or string (transaction amount)
    - timestamp: date/time (transaction timestamp)

    Returns analysis results including fraud detection metrics.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV file")

    try:
        # Read file content
        content = await file.read()
        # Fallback encoding parsing
        try:
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(io.StringIO(content.decode('latin-1')))
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid CSV encoding. Please use UTF-8 or Latin-1.")

        # Clean column names (strip spaces, lower case)
        df.columns = df.columns.str.strip().str.lower()

        # Validate columns
        validate_csv_columns(df)

        # Drop rows where required columns are entirely missing
        df = df.dropna(subset=REQUIRED_COLUMNS, how='all')

        # Process transactions
        transactions = process_csv_dataframe(df)

        if not transactions:
            raise HTTPException(status_code=400, detail="No valid transactions found in CSV")

        # Analyze for fraud
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
            "total_amount": float(df['amount'].sum()),
            "avg_amount": float(df['amount'].mean()),
            "suspicious_count": sum(1 for a in analysis_result.get('account_summaries', []) if a.get('risk_level') == 'high')
        }

        return JSONResponse(content={
            "transactions": transactions,
            "stats": stats,
            "analysis": analysis_result
        })

    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except HTTPException:
        # Re-raise HTTP exceptions to prevent them from being caught by generic Exception handler
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error during processing: {str(e)}")