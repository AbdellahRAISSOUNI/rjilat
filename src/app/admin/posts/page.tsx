'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { useEffect, useState } from 'react';

interface Post {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  author: {
    id: string;
    username: string;
  };
  likesCount: number;
  commentsCount: number;
  isPublic: boolean;
  createdAt: string;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'title'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'public' | 'hidden'>('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the post "${title}"? This action cannot be undone and will delete all associated comments.`)) {
      return;
    }

    setDeleteLoading(postId);
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
        alert(`Post "${title}" has been deleted successfully.`);
      } else {
        const data = await response.json();
        alert(`Failed to delete post: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const togglePostVisibility = async (postId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, isPublic: !isPublic } : post
        ));
      } else {
        alert('Failed to update post visibility');
      }
    } catch (error) {
      alert('Failed to update post visibility');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.username.toLowerCase().includes(searchTerm.toLowerCase());
    
        const matchesFilter = filterBy === 'all' ||
                         (filterBy === 'public' && post.isPublic) ||
                         (filterBy === 'hidden' && !post.isPublic);
    
    return matchesSearch && matchesFilter;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        return (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-800 h-32 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-white mb-2">Posts Management</h1>
          <p className="text-gray-400">Manage all posts with complete moderation control</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Posts</p>
                <p className="text-2xl font-bold text-white">{posts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Public Posts</p>
                <p className="text-2xl font-bold text-white">{posts.filter(p => p.isPublic).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Likes</p>
                <p className="text-2xl font-bold text-white">{posts.reduce((sum, post) => sum + post.likesCount, 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Comments</p>
                <p className="text-2xl font-bold text-white">{posts.reduce((sum, post) => sum + post.commentsCount, 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search posts by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'public' | 'hidden')}
                className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Posts</option>
                <option value="public">Public Only</option>
                <option value="hidden">Hidden Only</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
                className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedPosts.map((post) => (
            <div key={post.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="relative">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {post.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 truncate">{post.title}</h3>
                {post.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.description}</p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {post.author.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="ml-2 text-sm text-gray-300">{post.author.username}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      {post.likesCount}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      {post.commentsCount}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => togglePostVisibility(post.id, post.isPublic)}
                    className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                      post.isPublic 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {post.isPublic ? 'Make Private' : 'Make Public'}
                  </button>
                  <button
                    onClick={() => deletePost(post.id, post.title)}
                    disabled={deleteLoading === post.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
                  >
                    {deleteLoading === post.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No posts found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
