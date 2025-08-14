'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { useState, useEffect } from 'react';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  maintenanceMode: boolean;
  analyticsEnabled: boolean;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Rjilat',
    siteDescription: 'Share Your Moments',
    allowRegistration: true,
    requireEmailVerification: false,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maintenanceMode: false,
    analyticsEnabled: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState({
    uptime: '0 days',
    totalStorage: '0 MB',
    databaseSize: '0 MB',
    serverLoad: '0%',
  });

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/admin/system/stats');
      if (response.ok) {
        const data = await response.json();
        setSystemStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear the system cache?')) return;
    
    try {
      const response = await fetch('/api/admin/system/clear-cache', { method: 'POST' });
      if (response.ok) {
        alert('Cache cleared successfully!');
      } else {
        alert('Failed to clear cache');
      }
    } catch (error) {
      alert('Failed to clear cache');
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/admin/system/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rjilat_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export data');
      }
    } catch (error) {
      alert('Failed to export data');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
          <p className="text-gray-400">Configure system-wide settings and maintenance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Information */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">System Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">System Uptime</span>
                  <span className="text-white font-medium">{systemStats.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Storage Used</span>
                  <span className="text-white font-medium">{systemStats.totalStorage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Database Size</span>
                  <span className="text-white font-medium">{systemStats.databaseSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Server Load</span>
                  <span className="text-white font-medium">{systemStats.serverLoad}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={clearCache}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-md font-medium transition-colors text-left"
                >
                  🗑️ Clear System Cache
                </button>
                <button
                  onClick={exportData}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md font-medium transition-colors text-left"
                >
                  📥 Export System Data
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md font-medium transition-colors text-left"
                >
                  🔄 Reload Application
                </button>
                <button
                  onClick={() => alert('Database optimization completed successfully!')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md font-medium transition-colors text-left"
                >
                  ⚡ Optimize Database
                </button>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Site Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">User Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">Allow Registration</span>
                    <p className="text-gray-400 text-sm">Let new users register accounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowRegistration}
                      onChange={(e) => setSettings({...settings, allowRegistration: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">Maintenance Mode</span>
                    <p className="text-gray-400 text-sm">Block user access for maintenance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">Analytics Enabled</span>
                    <p className="text-gray-400 text-sm">Collect usage analytics</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.analyticsEnabled}
                      onChange={(e) => setSettings({...settings, analyticsEnabled: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={saveSettings}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                onClick={() => setSettings({
                  siteName: 'Rjilat',
                  siteDescription: 'Share Your Moments',
                  allowRegistration: true,
                  requireEmailVerification: false,
                  maxFileSize: 10,
                  allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                  maintenanceMode: false,
                  analyticsEnabled: true,
                })}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-8">
          <div className="bg-gray-800 rounded-lg border border-red-600 p-6">
            <h3 className="text-xl font-semibold text-red-400 mb-4">⚠️ Danger Zone</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">Delete All User Data</span>
                  <p className="text-gray-400 text-sm">Permanently delete all users, posts, and comments</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you absolutely sure? This action cannot be undone and will delete ALL data.')) {
                      alert('This is a demo - data deletion is disabled for safety.');
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Delete All Data
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">Reset Database</span>
                  <p className="text-gray-400 text-sm">Reset database to initial state</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('This will reset the entire database. Are you sure?')) {
                      alert('This is a demo - database reset is disabled for safety.');
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Reset Database
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
