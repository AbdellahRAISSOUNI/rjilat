'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from "framer-motion";
import { debounce } from 'lodash';

interface User {
  id: string;
  username: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
}

export default function SearchPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setUsers([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
          setHasSearched(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleFollow = async (username: string) => {
    if (!session || session.user.type !== 'user') {
      router.push('/login');
      return;
    }

    // Optimistic update
    setUsers(prev => prev.map(user => 
      user.username === username 
        ? { 
            ...user, 
            isFollowing: !user.isFollowing,
            followersCount: user.isFollowing ? user.followersCount - 1 : user.followersCount + 1
          }
        : user
    ));

    try {
      const response = await fetch(`/api/users/${username}/follow`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        // Update with server response
        setUsers(prev => prev.map(user => 
          user.username === username 
            ? { 
                ...user, 
                isFollowing: data.isFollowing,
                followersCount: data.followersCount
              }
            : user
        ));
      } else {
        // Revert optimistic update on error
        setUsers(prev => prev.map(user => 
          user.username === username 
            ? { 
                ...user, 
                isFollowing: !user.isFollowing,
                followersCount: user.isFollowing ? user.followersCount + 1 : user.followersCount - 1
              }
            : user
        ));
      }
    } catch (error) {
      console.error('Follow error:', error);
      // Revert optimistic update on error
      setUsers(prev => prev.map(user => 
        user.username === username 
          ? { 
              ...user, 
              isFollowing: !user.isFollowing,
              followersCount: user.isFollowing ? user.followersCount + 1 : user.followersCount - 1
            }
          : user
      ));
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <Link href="/" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Rjilat
              </Link>
              <span className="ml-3 sm:ml-4 text-pink-300">•</span>
              <span className="ml-3 sm:ml-4 text-lg sm:text-xl font-medium text-gray-900">Search</span>
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
                  <Link href="/feed" className="hidden sm:block text-gray-700 hover:text-pink-600 transition-colors duration-300 font-medium">
                    Feed
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
        {/* Search Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Creators</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Find and connect with amazing artists in the Rjilat community ✨
            </p>
          </motion.div>
        </motion.div>

        {/* Search Input */}
        <motion.div 
          className="mb-8 sm:mb-12"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="relative max-w-2xl mx-auto"
            variants={itemVariants}
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            />
          </motion.div>
        </motion.div>

        {/* Search Results */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {loading ? (
            <div className="space-y-4 sm:space-y-6">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 border border-pink-100 animate-pulse shadow-xl"
                  variants={itemVariants}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gradient-to-r from-pink-200 to-rose-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gradient-to-r from-pink-100 to-rose-100 rounded w-48"></div>
                    </div>
                    <div className="h-10 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full w-20"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : hasSearched && users.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 border border-pink-200/50 hover:border-pink-300 shadow-xl hover:shadow-2xl transition-all duration-500 group"
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Profile Picture */}
                    <Link href={`/user/${user.username}`}>
                      <motion.div 
                        className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-white font-bold text-lg sm:text-xl">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </motion.div>
                    </Link>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/user/${user.username}`}>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors duration-300 mb-2">
                          {user.username}
                        </h3>
                      </Link>
                      <div className="flex items-center space-x-4 sm:space-x-6 text-sm sm:text-base text-gray-600">
                        <span><strong className="text-gray-900">{user.postsCount}</strong> posts</span>
                        <span><strong className="text-gray-900">{user.followersCount}</strong> followers</span>
                        <span><strong className="text-gray-900">{user.followingCount}</strong> following</span>
                      </div>
                    </div>

                    {/* Follow Button */}
                    {session && session.user.type === 'user' && session.user.username !== user.username && (
                      <motion.button
                        onClick={() => handleFollow(user.username)}
                        className={`px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto ${
                          user.isFollowing
                            ? 'bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-300'
                            : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {user.isFollowing ? 'Unfollow' : 'Follow'}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : hasSearched && users.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              variants={itemVariants}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No users found</h3>
                <p className="text-gray-600">Try searching with different keywords or browse our community to discover amazing creators!</p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12"
              variants={itemVariants}
            >
              <motion.div 
                className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-pink-200"
                variants={itemVariants}
              >
                <motion.div
                  className="mx-auto h-16 w-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: [0, 0, 1, 1] },
                    scale: { duration: 3, repeat: Infinity, ease: [0.4, 0.0, 0.6, 1.0] }
                  }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Searching</h3>
                <p className="text-gray-600">Enter a username above to find and connect with creators in the Rjilat community!</p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}