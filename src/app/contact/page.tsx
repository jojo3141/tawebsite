"use client";

import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{type: "tween", duration: 0.4 }}
      className="bg-white shadow-lg rounded-2xl p-8 max-w-4xl mx-auto text-center"
    >
      <h2 className="text-3xl font-bold mb-4 text-purple-700">Contact</h2>
      <p className="text-gray-700 text-lg">
        For any questions, feel free to email me at:  
        <a href="mailto:jheger@student.ethz.ch" className="text-blue-600 hover:underline ml-1">
          jheger@student.ethz.ch
        </a>
      </p>
    </motion.div>
  );
}
