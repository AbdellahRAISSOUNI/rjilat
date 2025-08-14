'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  hasUpvoted?: boolean;
  createdAt: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.type !== 'user') {
      router.push('/login');
    } else {
      fetchPosts();
    }
  }, [session, status, router]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-rose-100 flex items-center justify-center">
        <motion.div
          className="w-20 h-20 border-4 border-pink-200 border-t-pink-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!session || session.user.type !== 'user') {
    return null;
  }

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
              <Link href="/home" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Rjilat
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/upload"
                  className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Upload</span>
                </Link>
              </motion.div>
              <div className="hidden sm:block bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-pink-100">
                <span className="text-sm text-gray-700">
                  Welcome, <span className="font-semibold text-pink-600">{session.user.username}</span>
                </span>
              </div>
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border border-pink-200">
                Creator
              </span>
              <motion.button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 sm:px-4 py-2 rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline">Sign Out</span>
                <svg className="sm:hidden w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 space-y-4 sm:space-y-0"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Your Beautiful Feed</h1>
            <p className="text-lg sm:text-xl text-gray-600">Discover and share stunning artistry with our community 😍</p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="sm:ml-4"
          >
            <Link
              href="/upload"
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl w-full sm:w-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Share Your Art
            </Link>
          </motion.div>
        </motion.div>

        {/* Posts Grid */}
        {loading ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {[...Array(12)].map((_, i) => (
              <motion.div key={i} className="animate-pulse" variants={itemVariants}>
                <div className="bg-gradient-to-br from-pink-100 to-rose-200 aspect-square rounded-3xl mb-4"></div>
                <div className="bg-gradient-to-r from-pink-100 to-rose-100 h-4 rounded-lg mb-2"></div>
                <div className="bg-gradient-to-r from-pink-100 to-rose-100 h-3 rounded-lg w-3/4"></div>
              </motion.div>
            ))}
          </motion.div>
        ) : posts.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {posts.map((post) => (
              <motion.div 
                key={post.id} 
                className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-pink-200/50 hover:border-pink-300"
                variants={itemVariants}
                whileHover={{ y: -12, scale: 1.03 }}
                transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
              >
                <Link href={`/post/${post.id}`} className="block">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-125 transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Premium overlay */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                        <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
                
                <div className="p-6">
                  <Link href={`/post/${post.id}`}>
                    <h3 className="font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-pink-600 transition-colors duration-300 text-lg leading-tight cursor-pointer">{post.title}</h3>
                  </Link>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Link 
                        href={`/user/${post.author.username}`}
                        className="h-8 w-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mr-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-white font-bold text-sm">
                          {post.author.username.charAt(0).toUpperCase()}
                        </span>
                      </Link>
                      <Link 
                        href={`/user/${post.author.username}`}
                        className="font-semibold text-gray-800 hover:text-pink-600 transition-colors duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        @{post.author.username}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <motion.button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleUpvote(post.id);
                        }}
                        disabled={session?.user.id === post.author.id}
                        className={`flex items-center bg-gradient-to-r from-pink-50 to-rose-50 px-3 py-1.5 rounded-full border border-pink-200 transition-all duration-300 ${
                          post.hasUpvoted
                            ? 'text-pink-600 border-pink-300 bg-pink-100'
                            : 'text-pink-500 hover:text-pink-600 hover:border-pink-300'
                        } ${
                          session?.user.id === post.author.id
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer hover:scale-110'
                        }`}
                        whileHover={{ scale: session?.user.id !== post.author.id ? 1.1 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg 
                          className={`w-4 h-4 mr-1.5 ${post.hasUpvoted ? 'fill-current' : ''}`} 
                          fill={post.hasUpvoted ? 'currentColor' : 'none'} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-semibold">{post.upvotesCount}</span>
                      </motion.button>
                      
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link 
                          href={`/post/${post.id}#comments`}
                          className="flex items-center bg-gradient-to-r from-rose-50 to-pink-50 px-3 py-1.5 rounded-full border border-rose-200 text-rose-500 hover:text-rose-600 hover:border-rose-300 transition-all duration-300"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold">{post.commentsCount}</span>
                        </Link>
                      </motion.div>
                    </div>
                    
                    <div className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16"
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <div className="max-w-lg mx-auto">
              <motion.div
                className="w-32 h-32 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: [0, 0, 1, 1] },
                  scale: { duration: 3, repeat: Infinity, ease: [0.4, 0.0, 0.6, 1.0] }
                }}
              >
                <svg className="w-16 h-16 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Your Canvas Awaits! 🎨</h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Ready to share your beautiful artistry with the Rjilat community? Upload your first masterpiece and start connecting with fellow creators! ✨
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/upload"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-lg"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Your First Creation
                  <motion.span 
                    className="ml-2"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🚀
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}