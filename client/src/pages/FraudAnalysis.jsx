/**
 * Fraud Analysis Page - Graph-Based AML Intelligence
 * Interactive network visualization and pattern detection
 */

import { Suspense, lazy, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
const NetworkGraph = lazy(() => import('../components/NetworkGraph'));
import useStore from '../store/useStore';
import {
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiZap,
  FiShare2,
  FiAlertTriangle,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast from 'react-hot-toast';

const FraudAnalysis = () => {
  const analysis = useStore((state) => state.analysis);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [highlightedAccount, setHighlightedAccount] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlySuspicious, setShowOnlySuspicious] = useState(false);
  const [riskThreshold, setRiskThreshold] = useState(30);
  const navigate = useNavigate();

  // Metrics cards data
  const metrics = [
    {
      title: "Cycles Detected",
      value: analysis?.summary?.cycles ?? 0,
      icon: <FiShare2 className="w-6 h-6" />,
      color: "from-red-500 to-red-600",
      description: "Money laundering loops identified",
      change: analysis?.summary?.cycles > 0 ? "+2" : "0"
    },
    {
      title: "Mule Accounts",
      value: analysis?.summary?.muleAccounts ?? 0,
      icon: <FiUsers className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      description: "Suspicious account patterns",
      change: analysis?.summary?.muleAccounts > 0 ? "+1" : "0"
    },
    {
      title: "Layering Chains",
      value: analysis?.summary?.layeringChains ?? 0,
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: "from-yellow-500 to-yellow-600",
      description: "Multi-step transfer patterns",
      change: analysis?.summary?.layeringChains > 0 ? "+3" : "0"
    },
    {
      title: "Rapid Patterns",
      value: analysis?.summary?.rapidPatterns ?? 0,
      icon: <FiZap className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      description: "Burst activity detected",
      change: analysis?.summary?.rapidPatterns > 0 ? "+1" : "0"
    }
  ];

  const visibleNodes = useMemo(() => {
    const nodes = analysis?.graphNodes ?? [];
    const summaries = analysis?.accountSummaries ?? [];
    return nodes.map(n => {
      const summary = summaries.find((item) => item.account === n.id);
      return { ...n, riskScore: summary?.riskScore || 0, incoming: summary?.incoming || 0, outgoing: summary?.outgoing || 0 };
    }).filter((node) => {
      if (showOnlySuspicious && node.riskScore < 30) return false;
      return node.riskScore >= riskThreshold;
    });
  }, [analysis, riskThreshold, showOnlySuspicious]);

  const visibleEdges = useMemo(() => {
    const edges = analysis?.graphEdges ?? [];
    const idSet = new Set(visibleNodes.map((node) => node.id));
    return edges.filter((edge) => idSet.has(edge.source) && idSet.has(edge.target));
  }, [analysis, visibleNodes]);

  const selectedSummary = useMemo(() => {
     if (!selectedAccount || !analysis?.accountSummaries) return null;
     const sum = analysis.accountSummaries.find(item => item.account === selectedAccount);
     
     // Find strictly connected accounts based on entire graph edges
     const edges = analysis.graphEdges || [];
     const connectedSet = new Set();
     edges.forEach(e => {
        if (e.source === selectedAccount) connectedSet.add(e.target);
        if (e.target === selectedAccount) connectedSet.add(e.source);
     });
     
     return { ...sum, connectedCount: connectedSet.size };
  }, [analysis, selectedAccount]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    const query = value.trim().toLowerCase();
    if (!query) {
      setHighlightedAccount(null);
      return;
    }

    const match = analysis?.accountSummaries.find((item) => item.account.toLowerCase().includes(query));
    setHighlightedAccount(match?.account || null);
  };



  if (!analysis) {
    return (
      <Layout title="Fraud Analysis" subtitle="Graph-based intelligence and pattern detection">
        <div className="flex flex-col items-center justify-center h-96 text-slate-400">
          <FiAlertTriangle className="w-16 h-16 mb-4 text-slate-600" />
          <p className="text-xl">👉 Upload dataset to view fraud network</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Fraud Analysis"
      subtitle="Graph-based intelligence and pattern detection for AML surveillance"
      action={
        <div className="text-slate-400 text-sm bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
          {analysis.rowsProcessed} transactions analyzed
        </div>
      }
    >


          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.color} bg-opacity-20`}>
                    <div className="text-white">{metric.icon}</div>
                  </div>
                  <span className="text-green-400 text-sm font-medium">{metric.change}</span>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
                  <p className="text-slate-500 text-xs">{metric.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Upload and Graph */}
            <div className="xl:col-span-2 space-y-6">
              {/* Upload section removed since handled by layout conditionally */}


              {/* Network Graph */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Transaction Network</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-slate-400">High Risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs text-slate-400">Medium Risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-slate-400">Low Risk</span>
                    </div>
                  </div>
                </div>

                  <Suspense
                    fallback={
                      <div className="h-96 grid place-items-center rounded-3xl bg-slate-950/90">
                        <span className="text-slate-400">Loading graph…</span>
                      </div>
                    }
                  >
                    <NetworkGraph
                      nodes={visibleNodes}
                      edges={visibleEdges}
                      selectedAccount={selectedAccount}
                      highlightedAccount={highlightedAccount}
                      onNodeSelect={setSelectedAccount}
                    />
                  </Suspense>
              </motion.div>
            </div>

            {/* Right Column - Filters and Details */}
            <div className="space-y-6">
              {/* Search and Filters */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiFilter className="w-5 h-5 mr-2 text-blue-400" />
                  Filters
                </h3>

                <div className="space-y-4">
                  {/* Search */}
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Search Account</label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Enter account ID..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Risk Threshold */}
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Risk Threshold: {riskThreshold}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={riskThreshold}
                      onChange={(e) => setRiskThreshold(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Suspicious Only */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="suspicious-only"
                      checked={showOnlySuspicious}
                      onChange={(e) => setShowOnlySuspicious(e.target.checked)}
                      className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="suspicious-only" className="text-slate-300 text-sm">
                      Show suspicious accounts only
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Selected Account Details */}
              {selectedSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-sm">Account ID</p>
                      <p className="text-white font-mono">{selectedAccount}</p>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm">Risk Level</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        selectedSummary.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                        selectedSummary.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {selectedSummary.riskLevel.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm">Risk Score</p>
                      <p className="text-white text-lg font-bold">{selectedSummary.riskScore} / 100</p>
                    </div>

                    <div className="flex justify-between">
                       <div>
                         <p className="text-slate-400 text-sm">Total Transactions</p>
                         <p className="text-white font-medium">{selectedSummary.incoming + selectedSummary.outgoing}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-slate-400 text-sm">In / Out</p>
                         <p className="text-white font-medium">{selectedSummary.incoming} / {selectedSummary.outgoing}</p>
                       </div>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm">Connected Accounts</p>
                      <p className="text-white font-medium">{selectedSummary.connectedCount} distinct entities</p>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm">Reasons</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedSummary.reasons.map((reason, index) => (
                          <span key={index} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Alerts Summary */}
              {analysis?.alerts && analysis.alerts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FiAlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                    High-Risk Alerts
                  </h3>

                  <div className="space-y-3">
                    {analysis.alerts.slice(0, 5).map((alert, index) => (
                      <div
                        key={index}
                        onClick={() => navigate(`/transactions/${alert.account}`)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedAccount === alert.account
                            ? 'bg-blue-500/20 border border-blue-500/30'
                            : 'bg-slate-700/30 hover:bg-slate-700/50'
                        }`}
                      >
                        <p className="text-white font-medium text-sm">{alert.account}</p>
                        <p className="text-slate-400 text-xs">Score: {alert.score}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
      </Layout>
  );
};

export default FraudAnalysis;