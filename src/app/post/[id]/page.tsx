'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  parentCommentId?: string;
  replies: Comment[];
  createdAt: string;
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const [postId, setPostId] = useState<string>('');
  
  useEffect(() => {
    params.then(({ id }) => setPostId(id));
  }, [params]);
  const { data: session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

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
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data.post);
      } else if (response.status === 404) {
        router.push('/404');
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleUpvote = async () => {
    if (!session || session.user.type !== 'user') {
      router.push('/login');
      return;
    }

    if (post?.author.id === session.user.id) {
      return; // Can't upvote own post
    }

    // Optimistic update for instant feedback
    setPost(prev => prev ? {
      ...prev,
      hasUpvoted: !prev.hasUpvoted,
      upvotesCount: prev.hasUpvoted ? prev.upvotesCount - 1 : prev.upvotesCount + 1
    } : null);

    try {
      const response = await fetch(`/api/posts/${postId}/upvote`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        // Update with actual server response
        setPost(prev => prev ? {
          ...prev,
          upvotesCount: data.upvotesCount,
          hasUpvoted: data.hasUpvoted
        } : null);
      } else {
        // Revert optimistic update on error
        setPost(prev => prev ? {
          ...prev,
          hasUpvoted: !prev.hasUpvoted,
          upvotesCount: prev.hasUpvoted ? prev.upvotesCount + 1 : prev.upvotesCount - 1
        } : null);
      }
    } catch (error) {
      console.error('Failed to upvote:', error);
      // Revert optimistic update on error
      setPost(prev => prev ? {
        ...prev,
        hasUpvoted: !prev.hasUpvoted,
        upvotesCount: prev.hasUpvoted ? prev.upvotesCount + 1 : prev.upvotesCount - 1
      } : null);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session || session.user.type !== 'user') {
      router.push('/login');
      return;
    }

    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent.trim() }),
      });

      if (response.ok) {
        setCommentContent('');
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!session || session.user.type !== 'user') {
      router.push('/login');
      return;
    }

    if (!replyContent.trim()) return;

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: replyContent.trim(),
          parentCommentId: parentId
        }),
      });

      if (response.ok) {
        setReplyContent('');
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
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

  if (!post) {
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The post you&apos;re looking for doesn&apos;t exist or has been removed.</p>
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

  const renderComment = (comment: Comment, depth = 0) => (
    <motion.div 
      key={comment.id} 
      className={`${depth > 0 ? 'ml-4 sm:ml-8 border-l-2 border-pink-200 pl-4 sm:pl-6' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: depth * 0.1 }}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-pink-200/50 mb-4 sm:mb-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center">
            <Link 
              href={`/user/${comment.author.username}`}
              className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mr-3 hover:shadow-lg hover:scale-110 transition-all duration-300"
            >
              <span className="text-white font-bold text-sm sm:text-base">
                {comment.author.username.charAt(0).toUpperCase()}
              </span>
            </Link>
            <div>
              <Link 
                href={`/user/${comment.author.username}`}
                className="font-bold text-gray-900 text-sm sm:text-base hover:text-pink-600 transition-colors duration-300"
              >
                {comment.author.username}
              </Link>
              <p className="text-gray-500 text-xs sm:text-sm">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">{comment.content}</p>
        
        {session && session.user.type === 'user' && (
          <motion.button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-pink-600 hover:text-rose-600 text-sm font-bold transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reply
          </motion.button>
        )}

        {replyingTo === comment.id && (
          <motion.div 
            className="mt-4 p-4 bg-pink-50/50 rounded-xl border border-pink-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm sm:text-base"
              rows={3}
              placeholder="Write your reply..."
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3">
              <motion.button
                onClick={() => handleReplySubmit(comment.id)}
                disabled={!replyContent.trim()}
                className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reply
              </motion.button>
              <motion.button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-bold transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {comment.replies.map(reply => renderComment(reply, depth + 1))}
    </motion.div>
  );

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

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Post */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-pink-200/50 mb-8 sm:mb-12 overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Post Header */}
          <motion.div 
            className="p-4 sm:p-6 border-b border-pink-100"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  href={`/user/${post.author.username}`}
                  className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
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
          </motion.div>

          {/* Post Title */}
          <motion.div 
            className="px-4 sm:px-6 py-3 sm:py-4"
            variants={itemVariants}
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{post.title}</h1>
          </motion.div>

          {/* Post Image */}
          <motion.div 
            className="relative aspect-[4/3] mx-4 sm:mx-6 mb-4 sm:mb-6 overflow-hidden rounded-xl sm:rounded-2xl"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>

          {/* Post Actions */}
          <motion.div 
            className="px-4 sm:px-6 pb-4 sm:pb-6"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-6">
                <motion.button
                  onClick={handleUpvote}
                  disabled={session?.user.id === post.author.id}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${
                    post.hasUpvoted
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
                      : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-pink-50 border border-pink-200'
                  } ${
                    session?.user.id === post.author.id
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

                <div className="flex items-center space-x-2 text-gray-700 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-pink-200 shadow-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-bold text-sm sm:text-base">{comments.length}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Comments Section */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-pink-200/50 overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="p-4 sm:p-6 border-b border-pink-100"
            variants={itemVariants}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Comments</h2>
          </motion.div>

          {/* Add Comment Form */}
          {session && session.user.type === 'user' ? (
            <motion.div 
              className="p-4 sm:p-6 border-b border-pink-100"
              variants={itemVariants}
            >
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-pink-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm sm:text-base"
                  rows={4}
                  placeholder="Share your thoughts..."
                  maxLength={1000}
                />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-3 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {commentContent.length}/1000 characters
                  </span>
                  <motion.button
                    type="submit"
                    disabled={!commentContent.trim() || submittingComment}
                    className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              className="p-4 sm:p-6 border-b border-pink-100 text-center"
              variants={itemVariants}
            >
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Sign in to join the conversation</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-6 py-3 rounded-full font-bold inline-block shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Sign In
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* Comments List */}
          <motion.div 
            className="p-4 sm:p-6"
            variants={itemVariants}
          >
            {comments.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {comments.map(comment => renderComment(comment))}
              </div>
            ) : (
              <motion.div 
                className="text-center py-8 sm:py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No comments yet</h3>
                <p className="text-gray-600 text-sm sm:text-base">Be the first to share your thoughts!</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}