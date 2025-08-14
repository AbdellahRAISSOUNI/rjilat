'use client';

import Header from '@/components/Header';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
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

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts?limit=12');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
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
    if (!session || session.user.type !== 'user') {
      router.push('/login');
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

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.25, 0.25, 0.75]
      }
    }
  };

  const heroTitleVariants = {
    hidden: { 
      y: 100, 
      opacity: 0,
      scale: 0.8
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1
      }
    }
  };

  const letterVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const galleryItemVariants = {
    hidden: { 
      y: 60, 
      opacity: 0, 
      scale: 0.8,
      rotateY: 15
    },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.25, 0.25, 0.75]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-rose-100 pb-20 sm:pb-0">
      <Header />
      
      {/* Enhanced Hero Section */}
      <motion.div 
        className="relative overflow-hidden min-h-[90vh] flex items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Enhanced Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full opacity-30 blur-3xl"
            initial={{ scale: 0, rotate: 0 }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              y: [-10, 10, -10]
            }}
            transition={{
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              y: { duration: 6, repeat: Infinity, ease: [0.4, 0.0, 0.6, 1.0] }
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-100 to-rose-200 rounded-full opacity-25 blur-3xl"
            initial={{ scale: 0, rotate: 0 }}
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              y: [10, -10, 10]
            }}
            transition={{
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              y: { duration: 8, repeat: Infinity, ease: [0.4, 0.0, 0.6, 1.0], delay: 2 }
            }}
          />
          
          {/* Additional floating elements */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-rose-200 to-pink-300 rounded-full opacity-20 blur-2xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div 
            className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-pink-300 to-rose-200 rounded-full opacity-15 blur-xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <motion.div 
              variants={heroTitleVariants}
              className="overflow-hidden"
            >
              <motion.h1 
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 mb-6 sm:mb-8 leading-tight"
                variants={letterVariants}
              >
                <motion.span variants={letterVariants} className="inline-block mr-4">
                  Wrina
                </motion.span>
                <motion.span 
                  variants={letterVariants}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 mr-4"
                >
                  Rjilatk
                </motion.span>
                <motion.span 
                  variants={letterVariants}
                  className="inline-block"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 2
                  }}
                >
                  😍😋
                </motion.span>
              </motion.h1>
            </motion.div>
            
            <motion.p 
              className="mt-4 sm:mt-6 text-lg sm:text-xl leading-6 sm:leading-8 text-gray-600 max-w-3xl mx-auto px-2"
              variants={itemVariants}
            >
              Welcome to <span className="font-semibold text-pink-600">Rjilat</span> - the premium platform for sharing and discovering 
              beautiful feet photography. Join our exclusive community of artists and enthusiasts.
            </motion.p>
            
            <motion.div 
              className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4"
              variants={itemVariants}
            >
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-600 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
              >
                <span className="relative z-10">Start Your Journey</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              <Link
                href="/login"
                className="group inline-flex items-center justify-center text-base sm:text-lg font-semibold text-gray-700 hover:text-pink-600 transition-colors duration-300 w-full sm:w-auto"
              >
                Already a member?
                <motion.span 
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </div>


        </div>
      </motion.div>



      {/* Redesigned Premium Gallery Section */}
      <motion.div 
        className="py-20 sm:py-28 lg:py-32 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-150px" }}
        variants={containerVariants}
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f8 25%, #fce7f3 50%, #f9a8d4 75%, #ec4899 100%)',
          backgroundSize: '400% 400%'
        }}
      >
        {/* Enhanced Background with animated gradients */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(251, 113, 133, 0.1), rgba(236, 72, 153, 0.1))',
            backgroundSize: '300% 300%'
          }}
        />
        
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full opacity-30 blur-2xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-3/4 right-10 w-24 h-24 bg-gradient-to-br from-rose-200 to-pink-300 rounded-full opacity-25 blur-xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-pink-300 to-rose-200 rounded-full opacity-20 blur-lg"
            animate={{
              x: [-20, 20, -20],
              y: [-30, 30, -30],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 10
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Gallery Header */}
          <motion.div className="text-center mb-16 sm:mb-20" variants={itemVariants}>
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-3xl mb-8 shadow-2xl"
              whileHover={{ 
                rotate: 360, 
                scale: 1.15,
                boxShadow: "0 25px 50px -12px rgba(236, 72, 153, 0.5)"
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              animate={{
                y: [0, -5, 0]
              }}
              style={{
                animationDuration: "3s",
                animationIterationCount: "infinite"
              }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </motion.div>
            
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 sm:mb-8"
              variants={heroTitleVariants}
            >
              <motion.span variants={letterVariants} className="inline-block">
                Premium
              </motion.span>{' '}
              <motion.span 
                variants={letterVariants}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700"
              >
                Gallery
              </motion.span>
            </motion.h2>
            
            <motion.p 
              className="text-xl sm:text-2xl text-gray-700 max-w-4xl mx-auto mb-10 sm:mb-12 px-4 leading-relaxed"
              variants={itemVariants}
            >
              Discover breathtaking artistry from our most talented creators. Each masterpiece captures the essence of beauty, 
              elegance, and artistic excellence in feet photography.
            </motion.p>
            
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/home"
                className="group relative inline-flex items-center px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 text-white font-bold rounded-full shadow-2xl hover:shadow-pink-500/50 transform hover:-translate-y-3 transition-all duration-500 text-lg sm:text-xl overflow-hidden"
              >
                <span className="relative z-10">Explore Full Gallery</span>
                <motion.span 
                  className="ml-4 group-hover:translate-x-2 transition-transform duration-300 relative z-10"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨
                </motion.span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-700 via-rose-600 to-pink-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>
                    </motion.div>



          {/* Enhanced Posts Grid */}
          {loading ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
              variants={containerVariants}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="animate-pulse group"
                  variants={galleryItemVariants}
                  style={{ perspective: "1000px" }}
                >
                  <div className="relative">
                    <div className="bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 aspect-[4/5] rounded-3xl mb-6 shadow-2xl"></div>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-pink-100 to-rose-100 h-6 rounded-xl"></div>
                      <div className="bg-gradient-to-r from-pink-100 to-rose-100 h-4 rounded-lg w-3/4"></div>
                      <div className="flex space-x-3">
                        <div className="bg-gradient-to-r from-pink-100 to-rose-100 h-10 w-20 rounded-full"></div>
                        <div className="bg-gradient-to-r from-pink-100 to-rose-100 h-10 w-16 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div className="text-center py-16" variants={itemVariants}>
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <svg className="w-12 h-12 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h3>
              <p className="text-gray-600 text-lg">{error}</p>
            </motion.div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-pink-100 hover:border-pink-300"
                >
                  <Link href={`/post/${post.id}`} className="block">
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Creator badge */}
                      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                          <span className="text-xs font-semibold text-gray-800">@{post.author.username}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link href={`/post/${post.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-pink-600 transition-colors duration-300">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpvote(post.id);
                          }}
                          disabled={!session || session.user.type !== 'user' || session.user.id === post.author.id}
                          className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                            post.hasUpvoted
                              ? 'bg-pink-500 text-white'
                              : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                          } ${
                            !session || session.user.type !== 'user' || session.user.id === post.author.id
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          }`}
                        >
                          <svg 
                            className={`w-4 h-4 mr-1 ${post.hasUpvoted ? 'fill-current' : ''}`} 
                            fill={post.hasUpvoted ? 'currentColor' : 'none'} 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post.upvotesCount}
                        </button>
                        
                        <Link 
                          href={`/post/${post.id}#comments`}
                          className="flex items-center px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-200 text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4 mr-1 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          {post.commentsCount}
                        </Link>
                      </div>
                      
                      <span className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div className="text-center py-16" variants={itemVariants}>
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
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Gallery Coming Soon!</h3>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  Our community is just getting started. Be among the first to share your stunning feet photography and help build this beautiful platform! 😍✨
                </p>
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/register"
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-lg"
                    >
                      <span>Join Rjilat Today</span>
                      <motion.span 
                        className="ml-2"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        🚀
                      </motion.span>
                    </Link>
                  </motion.div>
                  <p className="text-sm text-gray-500">
                    Already have an account? <Link href="/login" className="text-pink-600 font-semibold hover:text-rose-600">Sign in</Link> to start uploading
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Why Choose Rjilat Footer Section */}
      <motion.div 
        className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-20" variants={itemVariants}>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Rjilat</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join the most exclusive and sophisticated platform designed specifically for feet photography enthusiasts and professional artists worldwide.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div 
              className="group text-center"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div 
                className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-xl group-hover:shadow-2xl transition-shadow duration-500"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Gallery Experience</h3>
              <p className="text-gray-600 leading-relaxed">
                Showcase your artistry with ultra-high-quality image hosting, advanced editing tools, and stunning gallery layouts designed specifically for feet photography.
              </p>
            </motion.div>

            <motion.div 
              className="group text-center"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div 
                className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-xl group-hover:shadow-2xl transition-shadow duration-500"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Exclusive Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with sophisticated enthusiasts, professional photographers, and artists who truly appreciate the beauty, elegance, and artistry of feet photography.
              </p>
            </motion.div>

            <motion.div 
              className="group text-center"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div 
                className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-xl group-hover:shadow-2xl transition-shadow duration-500"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Safe & Secure Platform</h3>
              <p className="text-gray-600 leading-relaxed">
                Your content is protected with military-grade security, advanced privacy controls, enterprise-level cloud storage, and comprehensive content moderation.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="py-20 bg-gradient-to-r from-pink-500 to-rose-600 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: [0, 0, 1, 1]
            }}
          />
          <motion.div 
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-white/10 rounded-full"
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: [0, 0, 1, 1]
            }}
          />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
            variants={itemVariants}
          >
            Ready to Share Your Art?
          </motion.h2>
          <motion.p 
            className="text-xl text-pink-100 mb-10 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Join thousands of artists and enthusiasts who have made Rjilat their creative home. 
            Start your journey today and become part of our exclusive community.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <Link
              href="/register"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-pink-600 bg-white rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <span className="relative z-10">Join Rjilat Today</span>
            </Link>
            <Link
              href="/home"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white border-2 border-white rounded-full hover:bg-white hover:text-pink-600 transition-all duration-300"
            >
              Explore Gallery
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}