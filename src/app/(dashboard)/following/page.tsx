'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  imageUrl: string;
  author: {
    id: string;
    username: string;
  };
  upvotesCount: number;
  commentsCount: number;
  hasUpvoted: boolean;
  createdAt: string;
}

export default function FollowingFeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.type !== 'user') {
      router.push('/login');
      return;
    }

    fetchFollowingPosts();
  }, [session, status, router]);

  const fetchFollowingPosts = async () => {
    try {
      const response = await fetch('/api/posts/following');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        setError('Failed to load posts');
      }
    } catch (error) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/upvote`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, upvotesCount: data.upvotesCount, hasUpvoted: data.hasUpvoted }
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/feed" className="text-2xl font-bold text-blue-600">
                Rjilat
              </Link>
              <div className="hidden sm:flex items-center space-x-6">
                <Link href="/feed" className="text-gray-700 hover:text-gray-900">
                  Discover
                </Link>
                <Link href="/following" className="text-blue-600 font-medium">
                  Following
                </Link>
                <Link href="/home" className="text-gray-700 hover:text-gray-900">
                  My Feed
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/upload"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Upload
              </Link>
              <span className="text-sm text-gray-700">
                {session?.user.username}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Following Feed</h1>
          <p className="text-gray-600 mt-1">See what people you follow are sharing</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border animate-pulse">
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                </div>
                <div className="aspect-[4/3] bg-gray-300"></div>
                <div className="p-4">
                  <div className="flex space-x-4">
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                    <div className="h-8 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{error}</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
                {/* Post Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center">
                    <Link href={`/user/${post.author.username}`}>
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 cursor-pointer">
                        <span className="text-white font-medium">
                          {post.author.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </Link>
                    <div>
                      <Link href={`/user/${post.author.username}`}>
                        <h3 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                          {post.author.username}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post Title */}
                <div className="px-4 py-3">
                  <Link href={`/post/${post.id}`}>
                    <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                      {post.title}
                    </h2>
                  </Link>
                </div>

                {/* Post Image */}
                <Link href={`/post/${post.id}`} className="block">
                  <div className="relative aspect-[4/3] cursor-pointer">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover hover:opacity-95 transition-opacity"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </Link>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleUpvote(post.id)}
                      disabled={session?.user.id === post.author.id}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                        post.hasUpvoted
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${
                        session?.user.id === post.author.id
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                    >
                      <svg 
                        className={`w-5 h-5 ${post.hasUpvoted ? 'fill-current' : ''}`} 
                        fill={post.hasUpvoted ? 'currentColor' : 'none'} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="font-medium">{post.upvotesCount}</span>
                    </button>

                    <Link 
                      href={`/post/${post.id}#comments`}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-medium">{post.commentsCount} comments</span>
                    </Link>

                    <Link 
                      href={`/post/${post.id}`}
                      className="text-blue-600 hover:text-blue-500 font-medium text-sm"
                    >
                      View Post →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No posts from followed users</h3>
              <p className="text-gray-500 mb-6">Follow some users to see their posts here, or discover new content on the public feed.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/feed"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Discover Posts
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Find Users
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
