"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { smoothScrollToTop } from "@/utils/smoothScroll";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      mass: 0.5,
      damping: 20
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4 } 
  },
};

export default function ContactPage() {
    
  useEffect(() => {
    smoothScrollToTop(800);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-8 md:py-0">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 ring-1 ring-slate-200/50 p-8 md:p-12 overflow-hidden text-center"
      >
        {/* Title */}
        <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600 tracking-tight mb-8"
        >
            Contact & Questions
        </motion.h2>

        {/* WhatsApp section */}
        <motion.p variants={itemVariants} className="text-slate-600 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
          Join our WhatsApp group — many questions are shared there, so you might find answers faster.  
          You can also write me personally if you have a question!
        </motion.p>

        {/* QR code */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
          <p className="text-slate-500 mb-4 font-medium uppercase tracking-wider text-sm">Scan to join group</p>
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
             <Image 
                src="/whatsapp-qr.png" 
                alt="WhatsApp Group QR Code" 
                width={400}
                height={400}
                className="w-80 h-80 md:w-96 md:h-96 rounded-xl"
            />
          </div>
        </motion.div>

        {/* Email section */}
        <motion.div variants={itemVariants} className="inline-block p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
             <p className="text-slate-600 text-lg">
                Or reach me via email at: <br className="md:hidden" />
                <a 
                href="mailto:jheger@student.ethz.ch" 
                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline ml-1 transition-colors"
                >
                jheger@student.ethz.ch
                </a>
            </p>
        </motion.div>

      </motion.div>
    </div>
  );
}
