/**
 * Transactions Page - Transaction Data Management
 * Displays uploaded CSV data in a paginated, sortable table with search and filtering
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import useStore from '../store/useStore';
import { apiService } from '../services/api';
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUp,
  FiArrowDown,
  FiAlertTriangle
} from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast from 'react-hot-toast';

const Transactions = () => {
  const { accountId } = useParams();
  const allTransactions = useStore((state) => state.transactions);
  const globalStats = useStore((state) => state.stats);

  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [displayedTransactions, setDisplayedTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);

  const itemsPerPage = 50;

  useEffect(() => {
    // Local filter and sort
    if (!allTransactions) return;

    let filtered = [...allTransactions];

    // Account filter (if accountId is provided)
    if (accountId) {
      filtered = filtered.filter(
        t => t.sender === accountId || t.receiver === accountId
      );
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        t => t.sender.toLowerCase().includes(term) || t.receiver.toLowerCase().includes(term)
      );
    }

    // Suspicious filter
    if (showSuspiciousOnly) {
      filtered = filtered.filter(t => t.suspicious);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'timestamp') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to page 1 on filter/sort change
  }, [allTransactions, searchTerm, sortField, sortOrder, showSuspiciousOnly]);

  useEffect(() => {
    // Local pagination
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    setDisplayedTransactions(filteredTransactions.slice(startIdx, endIdx));
  }, [filteredTransactions, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const exportData = () => {
    // In production, this would call an export API
    toast.success('Export feature coming soon!');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getRiskBadge = (riskScore, suspicious) => {
    if (!riskScore) return null;

    let color = 'bg-green-500/20 text-green-400';
    if (suspicious || riskScore > 70) color = 'bg-red-500/20 text-red-400';
    else if (riskScore > 40) color = 'bg-yellow-500/20 text-yellow-400';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {riskScore}
      </span>
    );
  };

  return (
    <Layout
      title="Transactions"
      subtitle="View and analyze transaction data with advanced filtering"
      action={
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          <span>Export</span>
        </button>
      }
    >
      {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm">Total Transactions</p>
                <p className="text-2xl font-bold text-white">{globalStats?.total_transactions || 0}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(globalStats?.total_amount || 0)}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm">Avg Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(globalStats?.avg_amount || 0)}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm">Suspicious</p>
                <p className="text-2xl font-bold text-red-400">{globalStats?.suspicious_count || 0}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by sender or receiver..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </form>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-slate-400">
                  <input
                    type="checkbox"
                    checked={showSuspiciousOnly}
                    onChange={(e) => setShowSuspiciousOnly(e.target.checked)}
                    className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Suspicious only</span>
                </label>
              </div>
            </div>

          {/* Transactions Table */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>ID</span>
                        {sortField === 'id' && (
                          sortOrder === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('sender')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Sender</span>
                        {sortField === 'sender' && (
                          sortOrder === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('receiver')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Receiver</span>
                        {sortField === 'receiver' && (
                          sortOrder === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Amount</span>
                        {sortField === 'amount' && (
                          sortOrder === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('timestamp')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Timestamp</span>
                        {sortField === 'timestamp' && (
                          sortOrder === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Risk Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {!allTransactions ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4"><Skeleton className="h-4 bg-slate-700" count={10} /></td>
                    </tr>
                  ) : displayedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    displayedTransactions.map((txn, index) => (
                      <motion.tr
                        key={txn.id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-slate-700/30 transition-colors ${
                          txn.suspicious ? 'bg-red-500/5 border-l-4 border-l-red-500' : ''
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-white">{txn.id}</td>
                        <td className="px-6 py-4 text-sm text-white">{txn.sender}</td>
                        <td className="px-6 py-4 text-sm text-white">{txn.receiver}</td>
                        <td className="px-6 py-4 text-sm text-white font-mono">
                          {formatCurrency(txn.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {formatDate(txn.timestamp)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getRiskBadge(txn.risk_score, txn.suspicious)}
                            {txn.suspicious && <FiAlertTriangle className="w-4 h-4 text-red-400" />}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredTransactions.length > 0 && (
              <div className="px-6 py-4 bg-slate-700/20 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-slate-400 text-sm">Page {currentPage}</span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={filteredTransactions.length <= currentPage * itemsPerPage}
                      className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
      </Layout>
  );
};

export default Transactions;