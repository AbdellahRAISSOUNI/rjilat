'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserAnalytics {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  userGrowthRate: number;
  registrationTrends: Array<{
    date: string;
    count: number;
  }>;
  mostActiveUsers: Array<{
    id: string;
    username: string;
    postsCount: number;
    commentsCount: number;
    followersCount: number;
    lastActive: string;
    joinedAt: string;
    activityScore: number;
  }>;
  usersByMonth: Array<{
    month: string;
    count: number;
  }>;
  engagementMetrics: {
    avgPostsPerUser: number;
    avgCommentsPerUser: number;
    avgFollowersPerUser: number;
    userRetentionRate: number;
  };
}

interface ContentAnalytics {
  totalPosts: number;
  totalComments: number;
  totalUpvotes: number;
  contentGrowthRate: number;
  topPosts: Array<{
    id: string;
    title: string;
    author: string;
    upvotesCount: number;
    commentsCount: number;
    createdAt: string;
  }>;
  contentTrends: Array<{
    date: string;
    posts: number;
    comments: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'engagement'>('users');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [userResponse, contentResponse] = await Promise.all([
        fetch('/api/admin/analytics/users'),
        fetch('/api/admin/analytics/content')
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserAnalytics(userData);
      }

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setContentAnalytics(contentData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive insights into user behavior and platform performance</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            User Analytics
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'content'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Content Analytics
          </button>
          <button
            onClick={() => setActiveTab('engagement')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'engagement'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Engagement Metrics
          </button>
        </div>

        {/* User Analytics Tab */}
        {activeTab === 'users' && userAnalytics && (
          <div className="space-y-8">
            {/* User Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-500">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-white">{userAnalytics.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-500">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">New This Month</p>
                    <p className="text-2xl font-bold text-white">{userAnalytics.newUsersThisMonth}</p>
                    <p className="text-xs text-green-400">+{userAnalytics.userGrowthRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-500">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-white">{userAnalytics.activeUsers}</p>
                    <p className="text-xs text-gray-400">
                      {((userAnalytics.activeUsers / userAnalytics.totalUsers) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-500">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Retention Rate</p>
                    <p className="text-2xl font-bold text-white">{userAnalytics.engagementMetrics.userRetentionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Trends Chart */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Registration Trends (Last 30 Days)</h3>
              <div className="h-64 flex items-end space-x-2">
                {userAnalytics.registrationTrends.map((trend, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-blue-500 w-full rounded-t transition-all hover:bg-blue-400"
                      style={{
                        height: `${Math.max((trend.count / Math.max(...userAnalytics.registrationTrends.map(t => t.count))) * 200, 4)}px`
                      }}
                      title={`${trend.date}: ${trend.count} users`}
                    ></div>
                    <span className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-top-left">
                      {new Date(trend.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active Users */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Most Active Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 text-gray-400 font-medium">User</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Posts</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Comments</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Followers</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Activity Score</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Joined</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAnalytics.mostActiveUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-700">
                        <td className="py-3">
                          <Link 
                            href={`/user/${user.username}`}
                            className="text-blue-400 hover:text-blue-300 font-medium"
                          >
                            {user.username}
                          </Link>
                        </td>
                        <td className="py-3 text-white">{user.postsCount}</td>
                        <td className="py-3 text-white">{user.commentsCount}</td>
                        <td className="py-3 text-white">{user.followersCount}</td>
                        <td className="py-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {user.activityScore}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400 text-sm">
                          {new Date(user.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-gray-400 text-sm">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Content Analytics Tab */}
        {activeTab === 'content' && contentAnalytics && (
          <div className="space-y-8">
            {/* Content Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-500">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total Posts</p>
                    <p className="text-2xl font-bold text-white">{contentAnalytics.totalPosts.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-500">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total Comments</p>
                    <p className="text-2xl font-bold text-white">{contentAnalytics.totalComments.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-red-500">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total Upvotes</p>
                    <p className="text-2xl font-bold text-white">{contentAnalytics.totalUpvotes.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-500">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Growth Rate</p>
                    <p className="text-2xl font-bold text-white">+{contentAnalytics.contentGrowthRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Posts */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Performing Posts</h3>
              <div className="space-y-4">
                {contentAnalytics.topPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <Link 
                          href={`/post/${post.id}`}
                          className="text-white font-medium hover:text-blue-400"
                        >
                          {post.title}
                        </Link>
                        <p className="text-sm text-gray-400">by {post.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-red-400">{post.upvotesCount} ❤️</span>
                      <span className="text-blue-400">{post.commentsCount} 💬</span>
                      <span className="text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Metrics Tab */}
        {activeTab === 'engagement' && userAnalytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h4 className="text-lg font-semibold text-white mb-2">Avg Posts per User</h4>
                <p className="text-3xl font-bold text-blue-400">{userAnalytics.engagementMetrics.avgPostsPerUser.toFixed(1)}</p>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h4 className="text-lg font-semibold text-white mb-2">Avg Comments per User</h4>
                <p className="text-3xl font-bold text-green-400">{userAnalytics.engagementMetrics.avgCommentsPerUser.toFixed(1)}</p>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h4 className="text-lg font-semibold text-white mb-2">Avg Followers per User</h4>
                <p className="text-3xl font-bold text-purple-400">{userAnalytics.engagementMetrics.avgFollowersPerUser.toFixed(1)}</p>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h4 className="text-lg font-semibold text-white mb-2">User Retention</h4>
                <p className="text-3xl font-bold text-yellow-400">{userAnalytics.engagementMetrics.userRetentionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
