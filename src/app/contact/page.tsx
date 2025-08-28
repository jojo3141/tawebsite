"use client";

import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "tween", duration: 0.4 }}
      className="bg-white shadow-lg rounded-2xl p-8 max-w-4xl mx-auto text-center space-y-6 mt-20"
    >
      {/* Title */}
      <h2 className="text-3xl font-bold mb-4 text-purple-700">Contact & Questions</h2>

      {/* WhatsApp section first */}
      <p className="text-gray-700 text-lg">
        Join our WhatsApp group — many questions are shared there, so you might find answers faster.  
        You can also write me personally if you have a question!
      </p>

      {/* QR code */}
      <div className="flex flex-col items-center mt-4">
        <p className="text-gray-600 mb-2 font-medium">Scan the QR code to join:</p>
        <img 
          src="/whatsapp-qr.png" 
          alt="WhatsApp Group QR Code" 
          className="w-40 h-40 rounded-lg shadow-md"
        />
      </div>

      {/* Email section */}
      <p className="text-gray-700 text-lg mt-6">
        You can also reach me via email at:  
        <a 
          href="mailto:jheger@student.ethz.ch" 
          className="text-blue-600 hover:underline ml-1"
        >
          jheger@student.ethz.ch
        </a>
      </p>
    </motion.div>
  );
}
