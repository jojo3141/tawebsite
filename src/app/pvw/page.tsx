"use client";

import { motion } from "framer-motion";
import { DocumentIcon, ArrowDownTrayIcon, BookOpenIcon } from "@heroicons/react/24/outline";

export default function PVWPage() {
  const days = [1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-purple-200 selection:text-purple-900">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/80 via-indigo-50/50 to-transparent opacity-80 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto px-6 py-16 md:py-0 pt-8">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-6xl mx-auto mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]"
          >
            <motion.span 
              initial={{ backgroundPosition: '100% 50%' }}
              animate={{ backgroundPosition: ['100% 50%', '0% 50%'] }}
              transition={{
                  backgroundPosition: {
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "linear"
                  }
              }}
              style={{
                  backgroundImage: 'linear-gradient(90deg, #8248deee, #3d35e4ff, #8248deee, #3d35e4ff, #8248deee)',
                  backgroundSize: '200% auto',
              }}
              className="text-transparent bg-clip-text md:whitespace-nowrap"
            >
              PVW A&W
            </motion.span>
          </motion.h1>
        </div>

        {/* Separator */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full flex items-center gap-6 mb-12"
        >
             <div className="h-px bg-slate-200 flex-1" />
             <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-widest">
                <BookOpenIcon className="w-4 h-4" />
                <span>Materials</span>
             </div>
             <div className="h-px bg-slate-200 flex-1" />
        </motion.div>

        {/* General Docs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full mb-12"
        >
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-purple-200 hover:shadow-xl hover:shadow-purple-900/5 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <DocumentIcon className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-slate-800">Lernziele A&W</span>
            </div>
            <a
              href="/lessons/AuW_FS26/pvw-Lernziele.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm shadow-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download
            </a>
          </div>
        </motion.div>

        {/* Days Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        >
          {days.map((day) => (
            <div key={day} className="relative p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-900/5 transition-all duration-300 flex flex-col gap-6 group">
              {/* Number Watermark */}
              <div className="absolute top-0 right-2 text-6xl font-black text-slate-100 group-hover:text-purple-50/80 transition-colors z-0 select-none">
                {day}
              </div>

              <div className="relative z-10">
                  <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4 group-hover:border-purple-100 transition-colors">
                    Tag {day}
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                    {/* Vorlage */}
                    <div className="flex items-center justify-between group/doc">
                      <div className="flex items-center gap-3">
                        <DocumentIcon className="w-5 h-5 text-slate-400 group-hover/doc:text-purple-500 transition-colors" />
                        <span className="text-slate-700 font-medium group-hover/doc:text-purple-700 transition-colors">Tag {day} Vorlage</span>
                      </div>
                      <a
                        href={`/lessons/AuW_FS26/pvw-${day}-vorlage.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                        title="Download Vorlage"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </a>
                    </div>

                    {/* Lösung */}
                    <div className="flex items-center justify-between group/doc">
                      <div className="flex items-center gap-3">
                        <DocumentIcon className="w-5 h-5 text-slate-400 group-hover/doc:text-purple-500 transition-colors" />
                        <span className="text-slate-700 font-medium group-hover/doc:text-purple-700 transition-colors">Tag {day} mit Lösung</span>
                      </div>
                      <a
                        href={`/lessons/AuW_FS26/pvw-${day}-lösung.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                        title="Download Lösung"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
