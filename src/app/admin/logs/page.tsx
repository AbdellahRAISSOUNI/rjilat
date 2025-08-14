'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { useEffect, useState } from 'react';

interface AdminLogEntry {
  id: string;
  adminId: string;
  action: string;
  target: {
    type: 'user' | 'post' | 'comment' | 'system';
    id?: string;
    username?: string;
    title?: string;
  };
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface LogFilters {
  action: string;
  targetType: string;
  dateRange: 'today' | 'week' | 'month' | 'all';
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LogFilters>({
    action: 'all',
    targetType: 'all',
    dateRange: 'week'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.action !== 'all' && { action: filters.action }),
        ...(filters.targetType !== 'all' && { targetType: filters.targetType }),
        dateRange: filters.dateRange
      });

      const response = await fetch(`/api/admin/logs?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('delete')) {
      return '🗑️';
    } else if (action.includes('hide')) {
      return '👁️‍🗨️';
    } else if (action.includes('show')) {
      return '👁️';
    } else if (action.includes('bulk')) {
      return '📦';
    } else if (action === 'login') {
      return '🔑';
    } else if (action === 'logout') {
      return '🚪';
    } else if (action === 'view_analytics') {
      return '📊';
    }
    return '⚙️';
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete')) {
      return 'bg-red-100 text-red-800';
    } else if (action.includes('hide')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (action.includes('show')) {
      return 'bg-green-100 text-green-800';
    } else if (action.includes('bulk')) {
      return 'bg-purple-100 text-purple-800';
    } else if (action === 'login' || action === 'logout') {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-gray-800 h-16 rounded-lg"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Activity Logs</h1>
          <p className="text-gray-400">Complete audit trail of all administrative actions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Actions</p>
                <p className="text-2xl font-bold text-white">{pagination.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Deletions</p>
                <p className="text-2xl font-bold text-white">
                  {logs.filter(log => log.action.includes('delete')).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Moderation</p>
                <p className="text-2xl font-bold text-white">
                  {logs.filter(log => log.action.includes('hide') || log.action.includes('show')).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Bulk Actions</p>
                <p className="text-2xl font-bold text-white">
                  {logs.filter(log => log.action.includes('bulk')).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Actions</option>
              <option value="delete_user">Delete User</option>
              <option value="delete_post">Delete Post</option>
              <option value="delete_comment">Delete Comment</option>
              <option value="hide_post">Hide Post</option>
              <option value="show_post">Show Post</option>
              <option value="hide_comment">Hide Comment</option>
              <option value="show_comment">Show Comment</option>
              <option value="bulk_delete_posts">Bulk Delete Posts</option>
              <option value="bulk_delete_comments">Bulk Delete Comments</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>

            <select
              value={filters.targetType}
              onChange={(e) => setFilters(prev => ({ ...prev, targetType: e.target.value }))}
              className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Targets</option>
              <option value="user">Users</option>
              <option value="post">Posts</option>
              <option value="comment">Comments</option>
              <option value="system">System</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as 'today' | 'week' | 'month' | 'all' }))}
              className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 text-sm"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              Activity Logs ({pagination.total} total)
            </h2>
          </div>

          <div className="divide-y divide-gray-700">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{getActionIcon(log.action)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                        <span className="text-gray-400 text-sm">
                          on {log.target.type}
                        </span>
                        {log.target.username && (
                          <span className="text-blue-400 text-sm font-medium">
                            @{log.target.username}
                          </span>
                        )}
                        {log.target.title && (
                          <span className="text-green-400 text-sm font-medium">
                            &quot;{log.target.title.substring(0, 30)}...&quot;
                          </span>
                        )}
                      </div>
                      
                      <p className="text-white mb-2">{log.details}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                        {log.ipAddress && (
                          <span>IP: {log.ipAddress}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-400">No activity logs found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total logs)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
