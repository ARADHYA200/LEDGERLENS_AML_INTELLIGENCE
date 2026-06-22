/**
 * Profile Page - User Profile Management
 * Display and edit user information, role, and account settings
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import {
  FiUser,
  FiMail,
  FiShield,
  FiCalendar,
  FiEdit3,
  FiSave,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Anderson',
    email: 'john.anderson@ledgerlens.com',
    role: 'Senior AML Analyst',
    department: 'Financial Intelligence',
    joinDate: '2023-01-15',
    lastLogin: new Date().toISOString(),
    avatar: null,
    bio: 'Experienced AML analyst with 8+ years in financial crime prevention. Specialized in transaction monitoring and risk assessment.',
    permissions: ['upload_csv', 'view_alerts', 'generate_reports', 'manage_settings']
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  useEffect(() => {
    // Load profile from localStorage or API
    const savedProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');
    if (savedProfile) {
      setProfile(savedProfile);
      setEditedProfile(savedProfile);
    }
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      // In production, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      const updatedProfile = { ...editedProfile, lastUpdated: new Date().toISOString() };
      setProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-500/20 text-red-400';
      case 'senior aml analyst': return 'bg-purple-500/20 text-purple-400';
      case 'aml analyst': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Layout
      title="Profile"
      subtitle="Manage your account information and preferences"
      action={
        !isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FiEdit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        )
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FiUser className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{profile.name}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getRoleColor(profile.role)}`}>
                  {profile.role}
                </span>
                <p className="text-slate-400 text-sm">{profile.department}</p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-slate-400">
                    <FiCalendar className="w-4 h-4" />
                    <span className="text-sm">Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-slate-400">
                    <FiShield className="w-4 h-4" />
                    <span className="text-sm">Last login: {new Date(profile.lastLogin).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Profile Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-6">Account Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-white">{profile.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <FiMail className="w-4 h-4 text-slate-400" />
                        <p className="text-white">{profile.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Role</label>
                    {isEditing ? (
                      <select
                        value={editedProfile.role}
                        onChange={(e) => updateField('role', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="AML Analyst">AML Analyst</option>
                        <option value="Senior AML Analyst">Senior AML Analyst</option>
                        <option value="Admin">Admin</option>
                        <option value="Compliance Officer">Compliance Officer</option>
                      </select>
                    ) : (
                      <p className="text-white">{profile.role}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Department</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.department}
                        onChange={(e) => updateField('department', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-white">{profile.department}</p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-6">
                  <label className="block text-slate-400 text-sm font-medium mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Tell us about your experience..."
                    />
                  ) : (
                    <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Permissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Permissions & Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile.permissions.map((permission, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                  <FiShield className="w-5 h-5 text-green-400" />
                  <span className="text-white text-sm capitalize">
                    {permission.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Activity Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">247</p>
                <p className="text-slate-400 text-sm">Files Analyzed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">1,543</p>
                <p className="text-slate-400 text-sm">Alerts Reviewed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">89%</p>
                <p className="text-slate-400 text-sm">Detection Accuracy</p>
              </div>
            </div>
          </motion.div>
      </Layout>
  );
};

export default Profile;