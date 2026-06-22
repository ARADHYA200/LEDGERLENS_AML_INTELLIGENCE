/**
 * Upload Component - CSV File Upload and Analysis
 * Handles file upload to FastAPI backend with drag-and-drop support
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import {
  FiUpload,
  FiFileText,
  FiCheck,
  FiX,
  FiLoader,
  FiDownload
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const setData = useStore((state) => state.setData);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiService.uploadCSV(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setData(response);
      toast.success(`Successfully processed ${response.transactions?.length || 0} transactions`);

      // Reset after success
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      let message = 'Upload failed. Please check your CSV format.';
      if (error.response?.data?.detail) {
        message = Array.isArray(error.response.data.detail)
          ? error.response.data.detail[0].msg
          : error.response.data.detail;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message) {
        message = error.message;
      }
      toast.error(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
    } else if (droppedFile) {
      toast.error('Please select a CSV file');
    }
  };

  const handleChange = (event) => {
    const selected = event.target.files?.[0];
    if (selected) {
      if (selected.type === 'text/csv' || selected.name.endsWith('.csv')) {
        setFile(selected);
      } else {
        toast.error('Please select a CSV file');
      }
    }
  };

  const loadSampleData = async () => {
    setUploading(true);
    setUploadProgress(10);
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 20, 90));
      }, 100);
      
      const response = await apiService.getSampleData();
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setData(response);
      toast.success('Successfully loaded sample data');
    } catch (error) {
      console.error('Sample loading failed:', error);
      toast.error('Failed to load sample dataset');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const downloadSample = () => {
    // Create a sample CSV content
    const sampleData = `sender,receiver,amount,timestamp
ACC001,ACC002,1500.00,2024-01-15T10:30:00Z
ACC002,ACC003,750.50,2024-01-15T11:15:00Z
ACC003,ACC004,2200.00,2024-01-15T12:45:00Z
ACC004,ACC005,950.25,2024-01-15T14:20:00Z
ACC001,ACC005,3200.00,2024-01-15T16:10:00Z`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Sample CSV downloaded');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={loadSampleData}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
        >
          <FiFileText className="w-4 h-4" />
          <span>Load Sample Data</span>
        </button>
        <button
          onClick={downloadSample}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
        >
          <FiDownload className="w-4 h-4" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-400 bg-blue-500/10'
            : file
            ? 'border-green-400 bg-green-500/5'
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="space-y-4">
          {uploading ? (
            <>
              <FiLoader className="w-12 h-12 text-blue-400 mx-auto animate-spin" />
              <div>
                <p className="text-white font-medium">Uploading and analyzing...</p>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-slate-400 text-sm mt-1">{uploadProgress}% complete</p>
              </div>
            </>
          ) : file ? (
            <>
              <FiCheck className="w-12 h-12 text-green-400 mx-auto" />
              <div>
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-slate-400 text-sm">
                  {(file.size / 1024).toFixed(1)} KB • Ready to analyze
                </p>
              </div>
            </>
          ) : (
            <>
              <FiUpload className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <p className="text-white font-medium">Drop your CSV file here</p>
                <p className="text-slate-400 text-sm">
                  or click to browse • Required columns: sender, receiver, amount, timestamp
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Button */}
      {file && !uploading && (
        <div className="flex justify-center">
          <button
            onClick={handleUpload}
            className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <FiUpload className="w-5 h-5" />
            <span>Analyze Transactions</span>
          </button>
        </div>
      )}

      {/* CSV Format Info */}
      <div className="bg-slate-800/30 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">CSV Format Requirements:</h4>
        <div className="text-slate-400 text-sm space-y-1">
          <p>• <strong>sender:</strong> Account ID (string)</p>
          <p>• <strong>receiver:</strong> Account ID (string)</p>
          <p>• <strong>amount:</strong> Transaction amount (number)</p>
          <p>• <strong>timestamp:</strong> Date/time (ISO format or Unix timestamp)</p>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          Example: ACC001,ACC002,1500.00,2024-01-15T10:30:00Z
        </p>
      </div>
    </motion.div>
  );
};

export default Upload;