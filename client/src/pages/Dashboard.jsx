/**
 * Dashboard Page - AML Monitoring Overview
 * Main dashboard with KPI metrics, charts, and active alerts
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { apiService } from '../services/api';
import useStore from '../store/useStore';
import {
  FiTrendingUp,
  FiUsers,
  FiAlertTriangle,
  FiTarget,
  FiUpload,
  FiBarChart,
  FiPieChart,
  FiClock
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const analysis = useStore((state) => state.analysis);
  const alerts = useStore((state) => state.alerts) || analysis?.alerts || [];
  const stats = useStore((state) => state.stats);
  const setData = useStore((state) => state.setData);

  // Load sample data on mount only if no data has been loaded yet
  useEffect(() => {
    const loadSampleData = async () => {
      if (!analysis) {
        try {
          console.log('Loading sample data for dashboard...');
          const response = await apiService.getSampleData();
          setData(response);
          console.log('Sample data loaded:', response);
        } catch (error) {
          console.error('Failed to load sample data:', error);
        }
      }
    };

    loadSampleData();
  }, [analysis, setData]);

  // We don't fetch data here anymore, it's global.


  // KPI Cards Data
  const kpiCards = [
    {
      title: "Total Accounts",
      value: analysis?.accounts || stats?.total_accounts || 0,
      icon: <FiUsers className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Total Transactions",
      value: analysis?.totalTransactions || stats?.total_transactions || 0,
      icon: <FiBarChart className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "Fraud Detected",
      value: analysis?.alerts?.length || alerts.length || 0,
      icon: <FiAlertTriangle className="w-6 h-6" />,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500/10",
      change: "-15%",
      changeType: "negative"
    },
    {
      title: "Avg Risk Score",
      value: (alerts && alerts.length > 0) ? Math.round(alerts.reduce((sum, alert) => sum + (alert.score || 0), 0) / alerts.length) : 0,
      icon: <FiTarget className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      change: "+5%",
      changeType: "neutral"
    }
  ];

  // Sample chart data (would be real data in production)
  const timelineData = useMemo(() => {
    if (!analysis?.transactions || analysis.transactions.length === 0) {
      return [
        { time: '00:00', transactions: 0, risk: 0 },
        { time: '04:00', transactions: 0, risk: 0 },
        { time: '08:00', transactions: 0, risk: 0 },
        { time: '12:00', transactions: 0, risk: 0 },
        { time: '16:00', transactions: 0, risk: 0 },
        { time: '20:00', transactions: 0, risk: 0 },
      ];
    }

    // Group transactions by hour
    const hourlyData = {};
    analysis.transactions.forEach(txn => {
      const timestamp = new Date(txn.timestamp);
      const hour = timestamp.getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;

      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = { transactions: 0, risk: 0, count: 0 };
      }

      hourlyData[hourKey].transactions += 1;
      hourlyData[hourKey].count += 1;

      // Calculate average risk score for this hour
      const accountSummary = analysis.accountSummaries?.find(acc => acc.account === txn.sender || acc.account === txn.receiver);
      if (accountSummary) {
        hourlyData[hourKey].risk += accountSummary.riskScore;
      }
    });

    // Calculate average risk per hour
    Object.keys(hourlyData).forEach(hour => {
      if (hourlyData[hour].count > 0) {
        hourlyData[hour].risk = Math.round(hourlyData[hour].risk / hourlyData[hour].count);
      }
    });

    // Return data for the last 24 hours, grouped by 4-hour intervals
    const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    return hours.map(hour => ({
      time: hour,
      transactions: hourlyData[hour]?.transactions || 0,
      risk: hourlyData[hour]?.risk || 0
    }));
  }, [analysis]);

  const fraudDistribution = [
    { name: 'Cycles', value: analysis?.summary?.cycles || 0, color: '#EF4444' },
    { name: 'Mule Accounts', value: analysis?.summary?.muleAccounts || 0, color: '#F59E0B' },
    { name: 'Layering', value: analysis?.summary?.layeringChains || 0, color: '#10B981' },
    { name: 'Rapid Patterns', value: analysis?.summary?.rapidPatterns || 0, color: '#8B5CF6' },
  ];

  return (
    <Layout
      title="AML Dashboard"
      subtitle="Real-time fraud monitoring and analytics"
      action={
        <div className="flex items-center space-x-2 text-slate-400 text-sm">
          <FiClock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      }
    >
      {/* Upload Section */}
          {/* No Upload section here anymore */}


          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <div className={`text-white`}>{card.icon}</div>
                  </div>
                  <div className={`text-sm font-medium ${
                    card.changeType === 'positive' ? 'text-green-400' :
                    card.changeType === 'negative' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {card.change}
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-white">{card.value.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Transaction Timeline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiTrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                Transaction Timeline
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="risk"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ fill: '#EF4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Fraud Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiPieChart className="w-5 h-5 mr-2 text-purple-400" />
                Fraud Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={fraudDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {fraudDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Active Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <FiAlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                Active Alerts
              </h3>
              <span className="text-sm text-slate-400">{alerts.length} high-risk accounts</span>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <FiAlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No active alerts</p>
                  <p className="text-sm text-slate-500">Upload transaction data to detect fraud patterns</p>
                </div>
              ) : (
                alerts.slice(0, 5).map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                        <FiAlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Account {alert.account}</p>
                        <p className="text-slate-400 text-sm">
                          Risk Score: {alert.score} • {alert.reasons?.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                        alert.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {alert.riskLevel?.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {alerts.length > 5 && (
              <div className="mt-4 text-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  View all {alerts.length} alerts →
                </button>
              </div>
            )}
          </motion.div>
      </Layout>
  );
};

export default Dashboard;