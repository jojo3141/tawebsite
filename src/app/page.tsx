"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { lessons } from "@/data/lessons";
import { ClockIcon, MapPinIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { useCourse } from "@/context/CourseContext";

export default function HomePage() {
  const { course } = useCourse();
  const currentLessons = lessons[course];

  const courseTitle = course === "AD" ? "Algorithms & Data Structures" : "Algorithms & Probability";
  const semesterParam = course === "AD" ? "AuD_HS25" : "AuW_FS26";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-purple-200 selection:text-purple-900">
        
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/80 via-indigo-50/50 to-transparent opacity-80 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto px-6 py-16 md:py-0 pt-8">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-6xl mx-auto mb-12">
            
            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]"
            >
              Welcome to <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600 md:whitespace-nowrap">
                {courseTitle}
              </span>
            </motion.h1>



            {/* Info Line */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center items-center gap-8 text-slate-600"
            >
                <div className="flex items-center gap-2.5">
                    <ClockIcon className="w-6 h-6 text-blue-600" />
                    <span className="font-medium text-lg">Monday, 9:15am</span>
                </div>

                <div className="flex items-center gap-2.5">
                    <MapPinIcon className="w-6 h-6 text-blue-600" />
                    <span className="font-medium text-lg">HG D 5.1</span>
                </div>
            </motion.div>
        </div>

        {/* Separator / Scroll hint */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full flex items-center gap-6 mb-12"
        >
             <div className="h-px bg-slate-200 flex-1" />
             <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-widest">
                <BookOpenIcon className="w-4 h-4" />
                <span>Class Materials</span>
             </div>
             <div className="h-px bg-slate-200 flex-1" />
        </motion.div>

        {/* Lessons Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        >
          {currentLessons.slice().reverse().map((lesson) => (
            <Link
              key={lesson.week}
              href={`/lessons/${semesterParam}/${lesson.week}`}
              className="group block"
            >
              <div
                className="relative p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-900/5 transition-all duration-300 h-full flex flex-col"
              >
                 {/* Number Watermark */}
                 <div className="absolute top-0 right-2 text-6xl font-black text-slate-100 group-hover:text-purple-50/80 transition-colors -z-0 select-none">
                    {lesson.week}
                 </div>

                <div className="relative z-10">

                    
                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-purple-700 transition-colors">
                      {lesson.title}
                    </h3>
                    
                    <p className="text-slate-500 text-sm leading-relaxed mb-4 group-hover:text-slate-600">
                      {lesson.description}
                    </p>

                    <span className="inline-flex items-center text-sm font-semibold text-purple-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        View Details &rarr;
                    </span>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
