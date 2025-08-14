'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setError('Username must be between 3 and 20 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login?message=Registration successful! Please sign in.');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-rose-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full opacity-20 blur-3xl"
          animate={{
            y: [-15, 15, -15]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: [0.4, 0.0, 0.6, 1.0]
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tr from-pink-100 to-rose-200 rounded-full opacity-20 blur-3xl"
          animate={{
            y: [12, -12, 12]
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: [0.4, 0.0, 0.6, 1.0],
            delay: 1.5
          }}
        />
      </div>

      <motion.div 
        className="max-w-md w-full space-y-8 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Link href="/" className="flex justify-center mb-6">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center shadow-xl"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-2xl font-bold text-white">R</span>
            </motion.div>
          </Link>
          <h2 className="text-center text-4xl font-bold text-gray-900 mb-2">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Rjilat</span> today
          </h2>
          <p className="text-center text-lg text-gray-600">
            Start sharing your beautiful artistry with the world 🌟
          </p>
        </motion.div>

        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-pink-100"
          variants={itemVariants}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants}>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-4 py-3 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="Choose a unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">3-20 characters, letters and numbers only</p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full px-4 py-3 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </motion.div>

            {error && (
              <motion.div 
                className="rounded-2xl bg-red-50 border border-red-200 p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm text-red-700 font-medium">{error}</div>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Create account
                    <motion.span 
                      className="ml-2"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ✨
                    </motion.span>
                  </div>
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.div className="mt-6 pt-6 border-t border-pink-100" variants={itemVariants}>
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 border border-pink-200">
              <h4 className="font-semibold text-gray-800 mb-2">Join the Rjilat community:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>🎨 Share your beautiful artistry</li>
                <li>👥 Connect with fellow creators</li>
                <li>💖 Get appreciation for your work</li>
                <li>🔒 Safe and secure platform</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="text-center" variants={itemVariants}>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-pink-100">
            <span className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-pink-600 hover:text-rose-600 transition-colors duration-300">
                Sign in here
              </Link>
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}