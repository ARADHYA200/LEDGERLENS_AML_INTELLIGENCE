/**
 * Settings Page - Application Configuration
 * Theme toggle, notifications, fraud sensitivity, and API configuration
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import {
  FiMoon,
  FiSun,
  FiBell,
  FiBellOff,
  FiSettings,
  FiKey,
  FiSave,
  FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Settings = () => {
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    alerts: true,
    reports: false
  });
  const [fraudSensitivity, setFraudSensitivity] = useState(70);
  const [apiConfig, setApiConfig] = useState({
    openaiKey: '',
    webhookUrl: '',
    databaseUrl: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '{}');
    const savedSensitivity = parseInt(localStorage.getItem('fraudSensitivity') || '70');
    const savedApiConfig = JSON.parse(localStorage.getItem('apiConfig') || '{}');

    setTheme(savedTheme);
    setNotifications({ ...notifications, ...savedNotifications });
    setFraudSensitivity(savedSensitivity);
    setApiConfig({ ...apiConfig, ...savedApiConfig });

    // Apply theme
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toast.success(`Switched to ${newTheme} theme`);
  };

  const updateNotification = (key, value) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const updateFraudSensitivity = (value) => {
    setFraudSensitivity(value);
    localStorage.setItem('fraudSensitivity', value.toString());
  };

  const updateApiConfig = (key, value) => {
    const updated = { ...apiConfig, [key]: value };
    setApiConfig(updated);
    localStorage.setItem('apiConfig', JSON.stringify(updated));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // In production, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setTheme('dark');
    setNotifications({
      email: true,
      push: false,
      alerts: true,
      reports: false
    });
    setFraudSensitivity(70);
    setApiConfig({
      openaiKey: '',
      webhookUrl: '',
      databaseUrl: ''
    });

    localStorage.removeItem('theme');
    localStorage.removeItem('notifications');
    localStorage.removeItem('fraudSensitivity');
    localStorage.removeItem('apiConfig');

    document.documentElement.classList.add('dark');
    toast.success('Settings reset to defaults');
  };

  return (
    <Layout
      title="Settings"
      subtitle="Configure your AML dashboard preferences"
      action={
        <div className="flex flex-wrap gap-3">
          <button
            onClick={resetSettings}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      }
    >

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Appearance Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <FiSettings className="w-5 h-5 mr-2 text-blue-400" />
                Appearance
              </h3>

              <div className="space-y-6">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Theme</p>
                    <p className="text-slate-400 text-sm">Choose your preferred color scheme</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center space-x-3 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    {theme === 'dark' ? (
                      <>
                        <FiMoon className="w-4 h-4 text-blue-400" />
                        <span className="text-white">Dark</span>
                      </>
                    ) : (
                      <>
                        <FiSun className="w-4 h-4 text-yellow-400" />
                        <span className="text-white">Light</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <FiBell className="w-5 h-5 mr-2 text-green-400" />
                Notifications
              </h3>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-slate-400 text-sm">
                        {key === 'email' && 'Receive alerts via email'}
                        {key === 'push' && 'Browser push notifications'}
                        {key === 'alerts' && 'High-risk fraud alerts'}
                        {key === 'reports' && 'Weekly summary reports'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateNotification(key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Fraud Detection Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <FiSettings className="w-5 h-5 mr-2 text-red-400" />
                Fraud Detection
              </h3>

              <div className="space-y-6">
                {/* Sensitivity Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-white font-medium">Detection Sensitivity</p>
                    <span className="text-blue-400 font-mono">{fraudSensitivity}%</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    Higher sensitivity detects more potential fraud but may increase false positives
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={fraudSensitivity}
                    onChange={(e) => updateFraudSensitivity(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* API Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <FiKey className="w-5 h-5 mr-2 text-purple-400" />
                API Configuration
              </h3>

              <div className="space-y-4">
                {/* OpenAI API Key */}
                <div>
                  <label className="block text-white font-medium mb-2">OpenAI API Key</label>
                  <input
                    type="password"
                    value={apiConfig.openaiKey}
                    onChange={(e) => updateApiConfig('openaiKey', e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-slate-400 text-sm mt-1">Required for AI-powered insights generation</p>
                </div>

                {/* Webhook URL */}
                <div>
                  <label className="block text-white font-medium mb-2">Webhook URL</label>
                  <input
                    type="url"
                    value={apiConfig.webhookUrl}
                    onChange={(e) => updateApiConfig('webhookUrl', e.target.value)}
                    placeholder="https://your-webhook.com/alerts"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-slate-400 text-sm mt-1">Receive real-time alerts via webhook</p>
                </div>

                {/* Database URL */}
                <div>
                  <label className="block text-white font-medium mb-2">Database URL</label>
                  <input
                    type="url"
                    value={apiConfig.databaseUrl}
                    onChange={(e) => updateApiConfig('databaseUrl', e.target.value)}
                    placeholder="postgresql://user:pass@host:port/db"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-slate-400 text-sm mt-1">External database connection (optional)</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* System Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Version</p>
                <p className="text-white font-mono">v2.0.0</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Last Updated</p>
                <p className="text-white font-mono">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Environment</p>
                <p className="text-green-400 font-mono">Production Ready</p>
              </div>
            </div>
          </motion.div>
    </Layout>
  );
};

export default Settings;