"use client";

import { useState, useEffect } from "react";
import { lessons, Course } from "@/data/lessons";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { smoothScrollToTop } from "@/utils/smoothScroll";
import { useCourse } from "@/context/CourseContext";

interface LessonPageContentProps {
  week: number;
  forcedCourse?: Course;
}

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

export default function LessonPageContent({ week, forcedCourse }: LessonPageContentProps) {
  const { course, setCourse } = useCourse();
  
  useEffect(() => {
      if (forcedCourse) {
          setCourse(forcedCourse);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcedCourse]);

  const activeCourse = forcedCourse || course;
  const currentLessons = lessons[activeCourse];
  const lesson = currentLessons?.find((l) => l.week === week);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  useEffect(() => {
    smoothScrollToTop(800);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPdfLoaded(true);
    }, 500); 
    return () => clearTimeout(timer);
  }, []);

  if (!lesson) {
    return <p className="text-center mt-20 text-slate-500 text-lg">Lesson not found</p>;
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-8 md:py-0">
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 ring-1 ring-slate-200/50 p-8 md:p-12 overflow-hidden"
      >
        
        {/* Watermark Number */}
         <div className="absolute top-0 right-0 p-8 opacity-40 pointer-events-none select-none">
            <span className="text-9xl font-black text-slate-300">
                {lesson.week}
            </span>
         </div>


        {/* Header Section */}
        <div className="relative z-10 mb-5">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-purple-600 mb-6 transition-colors">
                 ← Back to overview
            </Link>

            <motion.h2 
                variants={itemVariants} 
                className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600 tracking-tight mb-4"
            >
                {lesson.title}
            </motion.h2>

            <motion.div variants={itemVariants} className="flex items-center gap-3">
                <p className="text-lg text-slate-600">
                    {lesson.description}
                </p>
            </motion.div>
        </div>

        {/* PDF Viewer */}
        {lesson.pdf && (
        <motion.div variants={itemVariants} className="mt-0">
            <div className="flex items-center mb-4">
                 {lesson.additionalPdf && (
                    <a
                      href={lesson.additionalPdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white text-slate-700 border border-slate-200 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 hover:border-purple-200 hover:text-purple-700 hover:shadow-md transition-all"
                    >
                      {lesson.additionalPdf.label}
                    </a>
                 )}
                 <a
                  href={lesson.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg shadow hover:bg-slate-800 hover:shadow-md transition-all"
                >
                  Download PDF
                </a>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-inner overflow-hidden min-h-[300px] relative">
            {pdfLoaded ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-full w-full"
                >
                    <object
                        data={lesson.pdf}
                        type="application/pdf"
                        className="w-full h-[60vh] md:h-[700px]"
                    >
                         <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
                            <p className="mb-4">Unable to display PDF directly.</p>
                            <a
                                href={lesson.pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 font-semibold underline hover:text-purple-800"
                            >
                               Click here to download/view the file.
                             </a>
                         </div>
                    </object>
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 gap-4">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="font-medium animate-pulse">Loading Document...</p>
                </div>
            )}
            </div>
        </motion.div>
        )}

      </motion.div>
    </div>
  );
}
