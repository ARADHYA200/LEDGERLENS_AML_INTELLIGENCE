import { useState } from 'react';
import { FiMenu, FiUpload, FiFileText, FiDownload } from 'react-icons/fi';
import { apiService } from '../services/api';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const Navbar = ({ onMenuClick }) => {
  const [uploading, setUploading] = useState(false);
  const setData = useStore((state) => state.setData);

  const loadSampleData = async () => {
    setUploading(true);
    try {
      const response = await apiService.getSampleData();
      setData(response);
      toast.success('Successfully loaded sample data');
    } catch (error) {
      console.error('Sample loading failed:', error);
      toast.error('Failed to load sample dataset');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploading(true);
    try {
      const response = await apiService.uploadCSV(file);
      setData(response);
      toast.success(`Successfully processed ${response.transactions?.length || 0} transactions`);
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
      event.target.value = '';
    }
  };

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-slate-950/90 backdrop-blur-xl border-b border-slate-700/50 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Hamburger Icon (mobile only) */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <FiMenu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-white md:text-2xl hidden sm:block">LedgerLens</h1>
          <p className="text-sm text-slate-400 hidden lg:block">AML intelligence command center</p>
        </div>
      </div>

      {/* Data Management Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Load Sample Data Button */}
        <button
          onClick={loadSampleData}
          disabled={uploading}
          className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
          title="Load sample dataset"
        >
          <FiFileText className="w-4 h-4" />
          <span className="hidden md:inline">Sample</span>
        </button>

        {/* Upload CSV Button */}
        <label className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm cursor-pointer">
          <FiUpload className="w-4 h-4" />
          <span className="hidden md:inline">Upload</span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/90 px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-slate-200">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold text-white">
          JL
        </div>
        <div className="hidden sm:block">
          <p className="font-medium text-white leading-tight">Jane Lee</p>
          <p className="text-slate-400 text-xs">Analyst</p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
