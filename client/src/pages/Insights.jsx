/**
 * Insights Page - AI-Powered AML Intelligence
 * Displays smart insights generated from transaction analysis
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import useStore from '../store/useStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { FiShare2, FiUsers, FiTrendingUp, FiZap, FiAlertTriangle } from 'react-icons/fi';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-200 font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color || entry.payload.color || '#fff' }}>
            Count: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Insights = () => {
  const analysis = useStore((state) => state.analysis);

  const { riskDistribution, topConnections, parsedAlerts } = useMemo(() => {
    console.log('Insights analysis:', analysis);
    if (!analysis || !analysis.accountSummaries) {
      return { riskDistribution: [], topConnections: [], parsedAlerts: [] };
    }

    let dist = { low: 0, medium: 0, high: 0 };
    const summaries = analysis.accountSummaries;

    // Scale risk (0-100) -> thresholds (<40 low, 40-70 med, >70 high)
    summaries.forEach((account) => {
      const risk = account.riskScore;
      if (risk < 40) dist.low += 1;
      else if (risk <= 70) dist.medium += 1;
      else dist.high += 1;
    });

    console.log('Risk distribution:', dist);

    const riskDistributionData = [
      { name: 'Low', value: dist.low, color: '#10B981' },       // Green
      { name: 'Medium', value: dist.medium, color: '#3B82F6' }, // Blue
      { name: 'High', value: dist.high, color: '#EF4444' }      // Red
    ];

    // Connection Analysis (Top 15)
    const connectionsData = summaries
      .map(acc => ({
        id: acc.account,
        connections: (acc.incoming?.length || 0) + (acc.outgoing?.length || 0)
      }))
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 15);

    console.log('Top connections:', connectionsData.slice(0, 3));

    // Dynamic Alerts parsing from reasons array attached to High/Critical accounts
    let tempAlerts = [];
    (analysis.alerts || []).forEach(alert => {
      (alert.reasons || []).forEach(reason => {
        const lower = reason.toLowerCase();
        let tag = 'MEDIUM';
        if (lower.includes('cycle') || lower.includes('circular') || lower.includes('loop')) tag = 'CRITICAL';
        else if (lower.includes('mule') || lower.includes('layering')) tag = 'HIGH';

        // Friendly text mapping
        let prefixText = '';
        if (tag === 'CRITICAL') prefixText = 'Circular transaction loop detected:';
        else if (lower.includes('mule')) prefixText = 'Mule account activity:';
        else if (lower.includes('layering')) prefixText = 'Layering chain isolated:';
        else prefixText = 'Suspicious threshold triggered:';

        tempAlerts.push({
          tag,
          account: alert.account,
          description: `${prefixText} ${alert.account} - ${reason}`
        });
      });
    });

    // Sub pattern summaries tracking back to the original summary dictionary if we don't have enough alerts
    if (analysis.summary?.cycles > 0 && tempAlerts.filter(a => a.tag === 'CRITICAL').length === 0) {
       tempAlerts.push({ tag: 'CRITICAL', account: 'Global', description: 'Circular transaction loops detected broadly.'});
    }

    // Weight logic for alert priority sorting
    const weight = { CRITICAL: 3, HIGH: 2, MEDIUM: 1 };
    tempAlerts.sort((a, b) => weight[b.tag] - weight[a.tag]);

    return {
      riskDistribution: riskDistributionData,
      topConnections: connectionsData,
      parsedAlerts: tempAlerts
    };
  }, [analysis]);

  if (!analysis) {
    return (
      <Layout title="AI Insights" subtitle="Smart fraud detection insights powered by machine learning">
        <div className="flex flex-col items-center justify-center h-96 text-slate-400">
          <FiAlertTriangle className="w-16 h-16 mb-4 text-slate-600" />
          <p className="text-xl">👉 Upload dataset to view insights</p>
        </div>
      </Layout>
    );
  }

  // Summary Metrics logic mapped exactly to requirements
  const patternMetrics = [
    { title: "Cycles Detected", value: analysis.summary?.cycles || 0, icon: <FiShare2 className="w-6 h-6 text-red-400" />, glow: "hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]" },
    { title: "Mule Accounts", value: analysis.summary?.muleAccounts || 0, icon: <FiUsers className="w-6 h-6 text-orange-400" />, glow: "hover:shadow-[0_0_15px_rgba(249,115,22,0.5)]" },
    { title: "Layering Detected", value: analysis.summary?.layeringChains || 0, icon: <FiTrendingUp className="w-6 h-6 text-yellow-400" />, glow: "hover:shadow-[0_0_15px_rgba(234,179,8,0.5)]" },
    { title: "Rapid Transactions", value: analysis.summary?.rapidPatterns || 0, icon: <FiZap className="w-6 h-6 text-purple-400" />, glow: "hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]" },
  ];

  return (
    <Layout
      title="Intelligence Insights"
      subtitle="Structured risk insights and systemic pattern detection."
    >
      {/* SECTION 3: PATTERN SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {patternMetrics.map((metric, i) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 transition-all duration-300 ${metric.glow} flex flex-col items-center justify-center text-center`}
          >
            <div className="mb-4 p-3 bg-slate-900/50 rounded-full">
              {metric.icon}
            </div>
            <p className="text-4xl font-black text-white mb-2">{metric.value}</p>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">{metric.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* SECTION 1: RISK DISTRIBUTION */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg"
        >
          <h3 className="text-xl font-bold text-white mb-6">Risk Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* SECTION 2: CONNECTION ANALYSIS */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg"
        >
          <h3 className="text-xl font-bold text-white mb-6">Top 15 Connections</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topConnections} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="id" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="connections" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* SECTION 4: ALERTS FEED */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg"
      >
        <h3 className="text-xl font-bold text-white mb-6">Alerts & Behavior Feed</h3>
        {parsedAlerts.length === 0 ? (
           <div className="py-8 text-center text-slate-500">No immediate threat anomalies flagged in this dataset.</div>
        ) : (
           <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
             {parsedAlerts.map((alert, idx) => {
               const tagColors = {
                 CRITICAL: 'bg-red-500/20 text-red-500 border border-red-500/30',
                 HIGH: 'bg-orange-500/20 text-orange-500 border border-orange-500/30',
                 MEDIUM: 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
               };
               return (
                 <div key={idx} className="flex flex-col sm:flex-row items-baseline gap-4 bg-slate-900/40 p-4 rounded-xl hover:bg-slate-900/70 transition-colors">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap uppercase tracking-wider ${tagColors[alert.tag] || tagColors.MEDIUM}`}>
                      {alert.tag}
                    </span>
                    <span className="text-slate-300 font-medium">
                      {alert.description}
                    </span>
                 </div>
               );
             })}
           </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Insights;