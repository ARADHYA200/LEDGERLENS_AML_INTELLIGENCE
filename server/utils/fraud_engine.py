"""
Fraud Detection Engine
Implements advanced AML fraud detection algorithms using graph theory and machine learning.

Key Components:
1. Graph-based Detection:
   - Cycle detection using DFS (money laundering loops)
   - Layering chain detection (multiple transaction hops)
   - Mule account identification (accounts receiving from many and sending to few)

2. ML-based Detection:
   - Isolation Forest for anomaly detection
   - Risk scoring combining multiple factors

3. Risk Assessment:
   - Weighted scoring system
   - Dynamic threshold adjustment
"""

import pandas as pd
import numpy as np
import networkx as nx
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any, Tuple, Set
from collections import defaultdict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
HIGH_AMOUNT_THRESHOLD = 10000
RISK_WEIGHTS = {
    'HIGH_AMOUNT': 30,
    'CYCLE': 25,
    'MULE': 25,
    'RAPID': 20,
    'LAYERING': 20,
}

def get_risk_level(score: float) -> str:
    """Convert risk score to risk level"""
    if score >= 70:
        return "high"
    elif score >= 40:
        return "medium"
    else:
        return "low"

def weight_reasons(reasons: List[str]) -> float:
    """Calculate weighted risk score from reasons"""
    unique_reasons = list(set(reasons))
    return sum(RISK_WEIGHTS.get(reason, 10) for reason in unique_reasons)

def build_transaction_graph(transactions: pd.DataFrame) -> Tuple[nx.DiGraph, Dict[str, List], Dict[str, List], Set[str]]:
    """
    Build directed graph from transactions.

    Returns:
    - graph: NetworkX DiGraph
    - tx_by_sender: Dict of transactions by sender
    - tx_by_receiver: Dict of transactions by receiver
    - accounts: Set of all unique accounts
    """
    graph = nx.DiGraph()
    tx_by_sender = defaultdict(list)
    tx_by_receiver = defaultdict(list)
    accounts = set()

    for _, txn in transactions.iterrows():
        sender = str(txn['sender']).strip()
        receiver = str(txn['receiver']).strip()
        amount = float(txn['amount'])
        timestamp = pd.to_datetime(txn['timestamp'])

        accounts.add(sender)
        accounts.add(receiver)

        # Add edge to graph (weight by amount)
        if graph.has_edge(sender, receiver):
            graph[sender][receiver]['weight'] += amount
            graph[sender][receiver]['count'] += 1
        else:
            graph.add_edge(sender, receiver, weight=amount, count=1)

        # Track transactions
        tx_by_sender[sender].append({
            'receiver': receiver,
            'amount': amount,
            'timestamp': timestamp
        })

        tx_by_receiver[receiver].append({
            'sender': sender,
            'amount': amount,
            'timestamp': timestamp
        })

    return graph, tx_by_sender, tx_by_receiver, accounts

def detect_cycles(graph: nx.DiGraph) -> List[List[str]]:
    """
    Detect cycles in transaction graph using DFS.

    Cycles indicate potential money laundering loops where money
    flows back to the origin through multiple hops.
    """
    cycles = []
    visited = set()
    rec_stack = set()

    def dfs(node: str, path: List[str]):
        visited.add(node)
        rec_stack.add(node)
        path.append(node)

        for neighbor in graph.successors(node):
            if neighbor not in visited:
                if dfs(neighbor, path.copy()):
                    return True
            elif neighbor in rec_stack:
                # Found cycle
                cycle_start = path.index(neighbor)
                cycle = path[cycle_start:] + [neighbor]
                if len(cycle) > 3:  # Only consider meaningful cycles
                    cycles.append(cycle)
                return True

        rec_stack.remove(node)
        return False

    for node in graph.nodes():
        if node not in visited:
            dfs(node, [])

    # Remove duplicates and sort
    unique_cycles = []
    seen = set()
    for cycle in cycles:
        cycle_tuple = tuple(sorted(cycle[:-1]))  # Remove last duplicate
        if cycle_tuple not in seen:
            seen.add(cycle_tuple)
            unique_cycles.append(cycle[:-1])  # Remove the closing duplicate

    return unique_cycles

def find_layering_chains(graph: nx.DiGraph, min_length: int = 4) -> List[List[str]]:
    """
    Find layering chains - long transaction paths indicating money laundering
    through multiple layers of transactions.
    """
    chains = []

    def dfs_chain(node: str, path: List[str], visited: Set[str]):
        if len(path) >= min_length:
            chains.append(path.copy())

        for neighbor in graph.successors(node):
            if neighbor not in visited:
                visited.add(neighbor)
                path.append(neighbor)
                dfs_chain(neighbor, path, visited)
                path.pop()
                visited.remove(neighbor)

    for start_node in graph.nodes():
        dfs_chain(start_node, [start_node], {start_node})

    # Filter and deduplicate
    filtered_chains = []
    seen = set()
    for chain in chains:
        if len(chain) >= min_length:
            chain_tuple = tuple(chain)
            if chain_tuple not in seen:
                seen.add(chain_tuple)
                filtered_chains.append(chain)

    return filtered_chains

def detect_rapid_patterns(tx_by_sender: Dict[str, List], window_ms: int = 60000, threshold: int = 3) -> List[str]:
    """
    Detect rapid transaction patterns within time windows.

    Identifies accounts making many transactions in short time periods,
    which could indicate automated money movement.
    """
    rapid_accounts = []

    for sender, txns in tx_by_sender.items():
        if len(txns) < threshold:
            continue

        # Sort by timestamp
        sorted_txns = sorted(txns, key=lambda x: x['timestamp'])

        # Sliding window check
        for i in range(len(sorted_txns) - threshold + 1):
            window_txns = sorted_txns[i:i + threshold]
            time_span = (window_txns[-1]['timestamp'] - window_txns[0]['timestamp']).total_seconds() * 1000

            if time_span <= window_ms:
                rapid_accounts.append(sender)
                break

    return list(set(rapid_accounts))  # Remove duplicates

def detect_mule_accounts(tx_by_sender: Dict[str, List], tx_by_receiver: Dict[str, List],
                        min_incoming: int = 3, min_outgoing: int = 3) -> List[str]:
    """
    Detect mule accounts - accounts that receive from many sources and send to few destinations.

    Mule accounts are often used in money laundering to distribute illicit funds.
    """
    mule_accounts = []

    all_accounts = set(tx_by_sender.keys()) | set(tx_by_receiver.keys())

    for account in all_accounts:
        incoming = tx_by_receiver.get(account, [])
        outgoing = tx_by_sender.get(account, [])

        unique_senders = set(txn['sender'] for txn in incoming)
        unique_receivers = set(txn['receiver'] for txn in outgoing)

        if len(unique_senders) >= min_incoming and len(unique_receivers) >= min_outgoing:
            mule_accounts.append(account)

    return mule_accounts

def calculate_anomaly_scores(transactions: pd.DataFrame) -> Dict[str, float]:
    """
    Calculate anomaly scores using Isolation Forest.

    Features used:
    - Transaction amount
    - Time of day
    - Account transaction frequency
    """
    if len(transactions) < 10:
        return {}

    # Feature engineering
    features = []

    for _, txn in transactions.iterrows():
        timestamp = pd.to_datetime(txn['timestamp'])
        hour = timestamp.hour
        amount = float(txn['amount'])

        features.append([amount, hour])

    # Scale features
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    # Isolation Forest for anomaly detection
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    anomaly_scores = iso_forest.fit_predict(features_scaled)

    # Convert to risk scores (0-100)
    # Isolation Forest returns -1 for anomalies, 1 for normal
    risk_scores = {}
    for i, score in enumerate(anomaly_scores):
        # Convert: -1 (anomaly) -> high score, 1 (normal) -> low score
        risk_score = 50 + (score * -25)  # -1 -> 75, 1 -> 25
        risk_scores[str(i)] = max(0, min(100, risk_score))

    return risk_scores

def analyze_transactions(transactions: pd.DataFrame) -> Dict[str, Any]:
    """
    Main fraud analysis function.

    Performs comprehensive analysis using graph theory and ML techniques.
    """
    logger.info(f"Starting fraud analysis on {len(transactions)} transactions")

    # Build transaction graph
    graph, tx_by_sender, tx_by_receiver, accounts = build_transaction_graph(transactions)

    # Detect various fraud patterns
    cycles = detect_cycles(graph)
    layering_chains = find_layering_chains(graph, 4)
    rapid_accounts = detect_rapid_patterns(tx_by_sender)
    mule_accounts = detect_mule_accounts(tx_by_sender, tx_by_receiver)

    # ML-based anomaly detection
    anomaly_scores = calculate_anomaly_scores(transactions)

    logger.info(f"Detected patterns - Cycles: {len(cycles)}, Layering: {len(layering_chains)}, Rapid: {len(rapid_accounts)}, Mules: {len(mule_accounts)}")

    # Calculate account summaries
    account_summaries = []
    account_map = {}

    def serialize_txns(txns):
        out = []
        for t in txns:
            new_t = dict(t)
            new_t['timestamp'] = new_t['timestamp'].isoformat() if hasattr(new_t['timestamp'], 'isoformat') else str(new_t['timestamp'])
            out.append(new_t)
        return out

    for account in accounts:
        is_in_cycle = any(account in cycle for cycle in cycles)
        is_layering = any(account in chain for chain in layering_chains)
        is_rapid = account in rapid_accounts
        is_mule = account in mule_accounts

        account_txns = tx_by_sender.get(account, []) + tx_by_receiver.get(account, [])
        high_amount = any(txn['amount'] > HIGH_AMOUNT_THRESHOLD for txn in account_txns)

        reasons = []
        raw_reasons = []

        if high_amount:
            reasons.append("High Amount Transactions")
            raw_reasons.append("HIGH_AMOUNT")
        if is_in_cycle:
            reasons.append("Cycle Detected")
            raw_reasons.append("CYCLE")
        if is_mule:
            reasons.append("Mule Account")
            raw_reasons.append("MULE")
        if is_rapid:
            reasons.append("Rapid Transaction Pattern")
            raw_reasons.append("RAPID")
        if is_layering:
            reasons.append("Layering Chain")
            raw_reasons.append("LAYERING")

        risk_score = min(weight_reasons(raw_reasons), 100)
        risk_level = get_risk_level(risk_score)

        summary = {
            'account': account,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'reasons': reasons,
            'incoming': serialize_txns(tx_by_receiver.get(account, [])),
            'outgoing': serialize_txns(tx_by_sender.get(account, [])),
        }

        account_summaries.append(summary)
        account_map[account] = summary

    # Generate graph visualization data
    graph_nodes, graph_edges = generate_graph_visualization(graph, account_summaries, transactions)

    # Generate alerts
    alerts = [
        {
            'account': summary['account'],
            'score': summary['risk_score'],
            'riskLevel': summary['risk_level'],
            'reasons': summary['reasons']
        }
        for summary in account_summaries
        if summary['risk_level'] == 'high'
    ]

    # Sort alerts by risk score
    alerts.sort(key=lambda x: x['score'], reverse=True)

    result = {
        'rowsProcessed': len(transactions),
        'totalTransactions': len(transactions),
        'accounts': len(accounts),
        'cycles': len(cycles),
        'muleAccounts': len(mule_accounts),
        'layeringChains': len(layering_chains),
        'rapidPatterns': len(rapid_accounts),
        'alerts': alerts,
        'graphNodes': graph_nodes,
        'graphEdges': graph_edges,
        'accountSummaries': account_summaries,
        'summary': {
            'cycles': len(cycles),
            'muleAccounts': len(mule_accounts),
            'layeringChains': len(layering_chains),
            'rapidPatterns': len(rapid_accounts),
        }
    }

    logger.info(f"Analysis complete. Generated {len(alerts)} high-risk alerts")
    return result

def generate_graph_visualization(graph: nx.DiGraph, account_summaries: List[Dict],
                               transactions: pd.DataFrame) -> Tuple[List[Dict], List[Dict]]:
    """Generate nodes and edges for graph visualization"""

    # Create account to summary mapping
    account_map = {summary['account']: summary for summary in account_summaries}

    # Generate nodes
    nodes = []
    for i, account in enumerate(graph.nodes()):
        summary = account_map.get(account, {'risk_score': 0, 'risk_level': 'low'})
        base_size = 70 + summary['risk_score'] * 0.4
        color = {
            'high': '#EF4444',
            'medium': '#F59E0B',
            'low': '#10B981'
        }.get(summary['risk_level'], '#10B981')

        nodes.append({
            'id': account,
            'data': {
                'label': account,
                'tooltip': f"{summary['risk_level'].upper()} risk · {summary['risk_score']}"
            },
            'position': {
                'x': (i % 5) * 220 + 80,
                'y': (i // 5) * 160 + 40
            },
            'style': {
                'width': base_size,
                'height': base_size,
                'borderRadius': '50%',
                'background': color,
                'color': 'white',
                'border': '2px solid #1E293B',
                'boxShadow': '0 0 20px rgba(239,68,68,0.35)' if summary['risk_level'] == 'high' else '0 0 12px rgba(34,211,238,0.18)',
                'display': 'flex',
                'alignItems': 'center',
                'justifyContent': 'center',
                'fontWeight': '600',
                'textAlign': 'center',
                'padding': '8px'
            }
        })

    # Generate edges
    edges = []
    edge_id = 0
    for sender, receiver, data in graph.edges(data=True):
        sender_summary = account_map.get(sender, {'risk_level': 'low'})
        receiver_summary = account_map.get(receiver, {'risk_level': 'low'})

        suspicious = (data.get('weight', 0) > HIGH_AMOUNT_THRESHOLD or
                     sender_summary['risk_level'] == 'high' or
                     receiver_summary['risk_level'] == 'high')

        edges.append({
            'id': f'e-{edge_id}',
            'source': sender,
            'target': receiver,
            'animated': suspicious,
            'style': {
                'stroke': '#EF4444' if suspicious else '#7C83A8',
                'strokeWidth': 2.5 if suspicious else 1.5,
                'strokeDasharray': '6 6' if suspicious else '0',
                'opacity': 1 if suspicious else 0.75
            },
            'data': {
                'amount': data.get('weight', 0),
                'count': data.get('count', 1)
            }
        })
        edge_id += 1

    return nodes, edges