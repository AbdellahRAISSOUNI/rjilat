'use client';

import Link from 'next/link';
import { motion } from "framer-motion";
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      className="bg-white/95 backdrop-blur-md shadow-sm border-b border-pink-100 sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Rjilat
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/login"
                className="px-6 py-3 text-sm font-semibold text-gray-700 hover:text-pink-600 border border-gray-200 rounded-full hover:border-pink-200 hover:bg-pink-50 transition-all duration-300"
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
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Register
              </Link>
            </motion.div>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-full text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-all duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="h-6 w-6"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: mobileMenuOpen ? 1 : 0, 
            height: mobileMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-2 pt-2 pb-4 space-y-3 bg-white/90 backdrop-blur-sm rounded-b-2xl border-t border-pink-100">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/login"
                className="block px-4 py-3 text-base font-semibold text-gray-700 hover:text-pink-600 border border-gray-200 rounded-2xl hover:border-pink-200 hover:bg-pink-50 transition-all duration-300 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/register"
                className="block px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl shadow-lg text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}