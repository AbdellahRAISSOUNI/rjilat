'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from "framer-motion";

interface UserProfile {
  id: string;
  username: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  joinedAt: string;
}

interface Post {
  id: string;
  title: string;
  imageUrl: string;
  upvotesCount: number;
  commentsCount: number;
  hasUpvoted: boolean;
  createdAt: string;
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const [username, setUsername] = useState<string>('');
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [followLoading, setFollowLoading] = useState(false);

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
    params.then(({ username }) => setUsername(username));
  }, [params]);

  useEffect(() => {
    if (username) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${username}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      } else if (response.status === 404) {
        router.push('/404');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`/api/users/${username}/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!session || session.user.type !== 'user') {
      router.push('/login');
      return;
    }

    setFollowLoading(true);
    try {
      const response = await fetch(`/api/users/${username}/follow`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? {
          ...prev,
          isFollowing: data.isFollowing,
          followersCount: data.followersCount
        } : null);
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!session || session.user.type !== 'user') {
      router.push('/login');
      return;
    }

    // Optimistic update
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-rose-100 flex items-center justify-center">
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-pink-200"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl"></div>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-rose-100 flex items-center justify-center">
        <motion.div 
          className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-pink-200 max-w-md mx-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-6">The user you&apos;re looking for doesn&apos;t exist.</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/" 
              className="inline-flex items-center bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              ← Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const isOwnProfile = session?.user?.username === profile.username;

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

      {/* Profile Header */}
      <motion.div 
        className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-pink-100"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div 
            className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6"
            variants={itemVariants}
          >
            {/* Profile Picture */}
            <motion.div 
              className="h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-white font-bold text-2xl sm:text-3xl">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">{profile.username}</h1>
                
                {!isOwnProfile && session && session.user.type === 'user' && (
                  <motion.button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-6 py-2 sm:py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
                      profile.isFollowing
                        ? 'bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-300'
                        : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700'
                    } disabled:opacity-50`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {followLoading ? 'Loading...' : profile.isFollowing ? 'Unfollow' : 'Follow'}
                  </motion.button>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center sm:justify-start space-x-6 sm:space-x-8 text-sm sm:text-base">
                <div className="text-center">
                  <span className="font-bold text-lg text-gray-900">{profile.postsCount}</span>
                  <p className="text-gray-600">Posts</p>
                </div>
                <div className="text-center">
                  <span className="font-bold text-lg text-gray-900">{profile.followersCount}</span>
                  <p className="text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <span className="font-bold text-lg text-gray-900">{profile.followingCount}</span>
                  <p className="text-gray-600">Following</p>
                </div>
              </div>

              <p className="text-gray-500 text-sm mt-3">
                Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <motion.div 
          className="flex justify-center mb-8"
          variants={itemVariants}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-pink-200">
            {(['posts', 'followers', 'following'] as const).map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Posts Grid */}
        {activeTab === 'posts' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {postsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 animate-pulse overflow-hidden shadow-xl"
                    variants={itemVariants}
                  >
                    <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gradient-to-r from-pink-200 to-rose-200 rounded mb-2"></div>
                      <div className="h-3 bg-gradient-to-r from-pink-100 to-rose-100 rounded w-3/4"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-pink-200/50 hover:border-pink-300 group"
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.03 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Link href={`/post/${post.id}`} className="block">
                      <div className="aspect-square relative overflow-hidden">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link href={`/post/${post.id}`}>
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors duration-300 line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpvote(post.id);
                            }}
                            disabled={!session || session.user.type !== 'user' || isOwnProfile}
                            className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${
                              post.hasUpvoted
                                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
                                : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-pink-50 border border-pink-200'
                            } ${
                              !session || session.user.type !== 'user' || isOwnProfile
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg 
                              className={`w-4 h-4 ${post.hasUpvoted ? 'fill-current' : ''}`} 
                              fill={post.hasUpvoted ? 'currentColor' : 'none'} 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="font-bold text-sm">{post.upvotesCount}</span>
                          </motion.button>

                          <div className="flex items-center space-x-1 text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border border-pink-200 shadow-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-bold text-sm">{post.commentsCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No posts yet</h3>
                  <p className="text-gray-600 mb-6">
                    {isOwnProfile 
                      ? "You haven't shared any posts yet. Start by uploading your first image!" 
                      : `${profile.username} hasn't shared any posts yet.`
                    }
                  </p>
                  {isOwnProfile && (
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
                  )}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Other tabs content */}
        {activeTab === 'followers' && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-pink-200 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Followers</h3>
              <p className="text-gray-600">This feature will be available soon!</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'following' && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-pink-200 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Following</h3>
              <p className="text-gray-600">This feature will be available soon!</p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}