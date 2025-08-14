'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import Link from 'next/link';

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.type !== 'user') {
      router.push('/login');
    }
  }, [session, status, router]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setError('');
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!image) {
      setError('Please select an image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('image', image);

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/home');
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch (error) {
      setError('An error occurred while uploading');
    } finally {
      setUploading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-rose-100 relative overflow-hidden pb-20 sm:pb-0">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full opacity-20 blur-3xl"
          animate={{
            y: [-10, 10, -10]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: [0.4, 0.0, 0.6, 1.0]
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-100 to-rose-200 rounded-full opacity-20 blur-3xl"
          animate={{
            y: [10, -10, 10]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: [0.4, 0.0, 0.6, 1.0],
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div className="mb-4 sm:mb-6" variants={itemVariants}>
              <Link href="/home" className="inline-flex items-center text-pink-600 hover:text-rose-600 transition-colors duration-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Feed
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Art</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                Upload your beautiful creations and connect with the Rjilat community ✨
              </p>
            </motion.div>
          </motion.div>

          {/* Upload Form */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 border border-pink-100"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Title Input */}
              <motion.div variants={itemVariants}>
                <label htmlFor="title" className="block text-lg font-semibold text-gray-700 mb-3">
                  Give your art a beautiful title 🎨
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-6 py-4 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-300 text-lg"
                  placeholder="Describe your masterpiece..."
                  maxLength={100}
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">Make it descriptive and engaging</p>
                  <p className="text-sm text-gray-500">{title.length}/100</p>
                </div>
              </motion.div>

              {/* Image Upload */}
              <motion.div variants={itemVariants}>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Upload your beautiful creation 📸
                </label>
                
                {!imagePreview ? (
                  <motion.div 
                    className="border-2 border-dashed border-pink-300 rounded-3xl p-12 text-center hover:border-pink-400 transition-all duration-300 bg-gradient-to-br from-pink-25 to-rose-25"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: [0.4, 0.0, 0.6, 1.0]
                      }}
                    >
                      <svg className="mx-auto h-16 w-16 text-pink-400 mb-6" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                    <div>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="block text-xl font-bold text-gray-900 mb-2">
                          Drag & drop or click to upload
                        </span>
                        <span className="block text-gray-600 mb-4">
                          PNG, JPG, GIF, or WebP up to 10MB
                        </span>
                        <motion.span 
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Choose File
                        </motion.span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-80 object-cover rounded-3xl border-2 border-pink-200 shadow-xl"
                      />
                      <motion.button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>
                    <div className="text-center">
                      <label htmlFor="image-replace" className="inline-flex items-center px-6 py-3 border-2 border-pink-300 rounded-full shadow-sm bg-white/80 backdrop-blur-sm text-pink-700 font-semibold hover:bg-pink-50 hover:border-pink-400 cursor-pointer transition-all duration-300">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Choose Different Image
                      </label>
                      <input
                        id="image-replace"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div 
                  className="bg-red-50 border-2 border-red-200 rounded-2xl p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex">
                    <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="font-semibold text-red-700">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div className="flex space-x-4" variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={uploading || !title.trim() || !image}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center text-lg shadow-xl hover:shadow-2xl"
                  whileHover={{ scale: uploading || !title.trim() || !image ? 1 : 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {uploading ? (
                    <>
                      <motion.div
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Uploading your art...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Share with Community
                      <motion.span 
                        className="ml-2"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ✨
                      </motion.span>
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={() => router.push('/home')}
                  className="px-8 py-4 border-2 border-pink-300 rounded-2xl shadow-sm bg-white/80 backdrop-blur-sm font-semibold text-pink-700 hover:bg-pink-50 hover:border-pink-400 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </motion.div>
            </form>
          </motion.div>

          {/* Upload Guidelines */}
          <motion.div 
            className="mt-12 bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-3xl p-8"
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <h3 className="text-xl font-bold text-pink-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Upload Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-pink-700 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                  JPEG, PNG, GIF, or WebP format only
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                  Maximum file size of 10MB
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                  High-quality images get better engagement
                </li>
              </ul>
              <ul className="text-pink-700 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-rose-400 rounded-full mr-3"></span>
                  Images are automatically optimized
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-rose-400 rounded-full mr-3"></span>
                  Follow our community guidelines
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-rose-400 rounded-full mr-3"></span>
                  Be respectful and creative! 💕
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}