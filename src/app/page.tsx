"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-100 to-indigo-50 p-6">
      
      {/* Hero Section */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl md:text-6xl font-extrabold text-center text-purple-700 mb-10"
      >
        Welcome to my classes! 📚
      </motion.h1>

      {/* Introduction */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-center text-lg md:text-xl text-gray-700 max-w-2xl mb-12"
      >
        Here you will find all weekly lesson materials, notes, and resources to help you succeed. Check the lessons below!
      </motion.p>

      {/* Sample Lessons Preview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="grid md:grid-cols-2 gap-6 w-full max-w-4xl"
      >
        <Link href="/lessons/week-1" className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-600 transition-colors duration-300">
            Week 1 – Introduction
          </h3>
          <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
            Start your journey with the fundamentals of algorithms and programming.
          </p>
        </Link>

        <Link href="/lessons/week-2" className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-600 transition-colors duration-300">
            Week 2 – Sorting & Searching
          </h3>
          <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
            Learn essential sorting and searching algorithms with visual examples.
          </p>
        </Link>
      </motion.div>

    </div>
  );
}
