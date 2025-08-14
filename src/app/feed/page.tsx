'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from "framer-motion";

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

export default function FeedPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [sortBy]);

  const fetchPosts = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const response = await fetch(`/api/posts?page=${currentPage}&sortBy=${sortBy}&limit=12`);
      
      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setPosts(data.posts);
          setPage(2);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
          setPage(prev => prev + 1);
        }
        setHasMore(data.pagination.hasNext);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!session || session.user.type !== 'user') {
      return;
    }

    // Optimistic update for instant feedback
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            hasUpvoted: !post.hasUpvoted,
            upvotesCount: post.hasUpvoted ? post.upvotesCount - 1 : post.upvotesCount + 1
          }
        : post
    ));

    try {
      const response = await fetch(`/api/posts/${postId}/upvote`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        // Update with actual server response
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, upvotesCount: data.upvotesCount, hasUpvoted: data.hasUpvoted }
            : post
        ));
      } else {
        // Revert optimistic update on error
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                hasUpvoted: !post.hasUpvoted,
                upvotesCount: post.hasUpvoted ? post.upvotesCount + 1 : post.upvotesCount - 1
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to upvote:', error);
      // Revert optimistic update on error
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              hasUpvoted: !post.hasUpvoted,
              upvotesCount: post.hasUpvoted ? post.upvotesCount + 1 : post.upvotesCount - 1
            }
          : post
      ));
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPosts(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-rose-100 pb-20 sm:pb-0">
      {/* Header */}
      <motion.nav 
        className="bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <Link href="/" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Rjilat
              </Link>
              <span className="ml-3 sm:ml-4 text-pink-300">•</span>
              <span className="ml-3 sm:ml-4 text-lg sm:text-xl font-medium text-gray-900">Feed</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {session ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/upload"
                      className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <span className="hidden sm:inline">Upload</span>
                      <svg className="sm:hidden w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Link>
                  </motion.div>
                  <Link href="/home" className="hidden sm:block text-gray-700 hover:text-pink-600 transition-colors duration-300 font-medium">
                    Dashboard
                  </Link>
                  <div className="hidden sm:block bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 border border-pink-100">
                    <span className="text-sm text-gray-700 font-medium">{session.user.username}</span>
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/login"
                      className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-full text-sm font-medium transition-colors duration-300"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/register"
                      className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Register
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full opacity-20 blur-3xl"
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-rose-200 to-pink-300 rounded-full opacity-20 blur-3xl"
          animate={{
            y: [10, -10, 10],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Feed Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 space-y-4 sm:space-y-0"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Feed</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">Discover amazing moments shared by our community ✨</p>
          </motion.div>
          
          {/* Sort Options */}
          <motion.div 
            className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-pink-100 shadow-lg"
            variants={itemVariants}
          >
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
              className="bg-transparent border-none text-sm font-semibold text-pink-600 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
            </select>
          </motion.div>
        </motion.div>

        {/* Posts Feed */}
        {loading && posts.length === 0 ? (
          <motion.div 
            className="space-y-6 sm:space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i} 
                className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-pink-100 animate-pulse overflow-hidden shadow-xl"
                variants={itemVariants}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full mr-3"></div>
                    <div>
                      <div className="h-4 bg-gradient-to-r from-pink-200 to-rose-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gradient-to-r from-pink-100 to-rose-100 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gradient-to-r from-pink-200 to-rose-200 rounded w-3/4 mb-4"></div>
                </div>
                <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-rose-200"></div>
                <div className="p-4 sm:p-6">
                  <div className="flex space-x-4">
                    <div className="h-8 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full w-16"></div>
                    <div className="h-8 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full w-20"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : posts.length > 0 ? (
          <motion.div 
            className="space-y-6 sm:space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {posts.map((post) => (
              <motion.div 
                key={post.id} 
                className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-pink-200/50 hover:border-pink-300 hover:shadow-2xl transition-all duration-500 overflow-hidden shadow-xl group"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Post Header */}
                <div className="p-4 sm:p-6 border-b border-pink-100">
                  <div className="flex items-center">
                    <Link 
                      href={`/user/${post.author.username}`}
                      className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mr-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    >
                      <span className="text-white font-bold text-sm sm:text-base">
                        {post.author.username.charAt(0).toUpperCase()}
                      </span>
                    </Link>
                    <div>
                      <Link 
                        href={`/user/${post.author.username}`}
                        className="font-bold text-gray-900 text-sm sm:text-base hover:text-pink-600 transition-colors duration-300"
                      >
                        {post.author.username}
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post Title */}
                <div className="px-4 sm:px-6 py-3 sm:py-4">
                  <Link href={`/post/${post.id}`}>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 hover:text-pink-600 cursor-pointer transition-colors duration-300 group-hover:text-pink-600">
                      {post.title}
                    </h2>
                  </Link>
                </div>

                {/* Post Image */}
                <Link href={`/post/${post.id}`} className="block">
                  <div className="relative aspect-[4/3] cursor-pointer overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </Link>

                {/* Post Actions */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 sm:space-x-6">
                      <motion.button
                        onClick={() => handleUpvote(post.id)}
                        disabled={!session || session.user.type !== 'user' || session.user.id === post.author.id}
                        className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${
                          post.hasUpvoted
                            ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
                            : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-pink-50 border border-pink-200'
                        } ${
                          !session || session.user.type !== 'user' || session.user.id === post.author.id
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg 
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${post.hasUpvoted ? 'fill-current' : ''}`} 
                          fill={post.hasUpvoted ? 'currentColor' : 'none'} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-bold text-sm sm:text-base">{post.upvotesCount}</span>
                      </motion.button>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link 
                          href={`/post/${post.id}#comments`}
                          className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors duration-300 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-pink-200 shadow-lg hover:shadow-xl"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="font-bold text-sm sm:text-base">{post.commentsCount}</span>
                        </Link>
                      </motion.div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link 
                        href={`/post/${post.id}`}
                        className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        View Post →
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <motion.div 
                className="text-center py-8"
                variants={itemVariants}
              >
                <motion.button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? 'Loading...' : 'Load More Posts'}
                </motion.button>
              </motion.div>
            )}

            {!hasMore && posts.length > 0 && (
              <motion.div 
                className="text-center py-8"
                variants={itemVariants}
              >
                <p className="text-gray-600 font-medium">You&apos;ve reached the end of the feed! 🎉</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-pink-200"
              variants={itemVariants}
            >
              <motion.div
                className="mx-auto h-16 w-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No posts yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share your amazing images with the community!</p>
              {session ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/upload"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Upload Your First Image
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/register"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Join the Community
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}