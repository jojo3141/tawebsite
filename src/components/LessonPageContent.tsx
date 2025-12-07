import { useState, useEffect } from "react";
import { lessons } from "@/data/lessons";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { smoothScrollToTop } from "@/utils/smoothScroll";

interface LessonPageContentProps {
  week: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: "easeOut" 
    } 
  },
};

export default function LessonPageContent({ week }: LessonPageContentProps) {
  const lesson = lessons.find((l) => l.week === week);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  useEffect(() => {
    // Smooth scroll to top when the page opens
    smoothScrollToTop(1000);
  }, []);

  // Simulate PDF loading or handle actual load event if possible
  useEffect(() => {
    const timer = setTimeout(() => {
      setPdfLoaded(true);
    }, 500); // Small artificial delay for smooth entrance
    return () => clearTimeout(timer);
  }, []);

  if (!lesson) {
    return <p className="text-center mt-20 text-gray-600">Lesson not found</p>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10"
    >
      {/* Title */}
      <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-6 text-purple-700">
        Week {lesson.week} – {lesson.title}
      </motion.h2>

      {/* Description */}
      <motion.p variants={itemVariants} className="mb-6 text-lg text-gray-700">
        {lesson.description}
      </motion.p>

      {/* Additional PDF Link */}
      {lesson.additionalPdf && (
        <motion.div variants={itemVariants} className="mb-6">
          <a
            href={lesson.additionalPdf.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium flex items-center gap-2"
          >
            📄 {lesson.additionalPdf.label}
          </a>
        </motion.div>
      )}

      {/* PDF Viewer */}
      {lesson.pdf && (
        <motion.div variants={itemVariants} className="min-h-[50vh]">
          {pdfLoaded ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <a
                  href={lesson.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  📥 Download PDF
                </a>
              </div>

              <object
                data={lesson.pdf}
                type="application/pdf"
                className="w-full h-[90vh] border rounded-lg shadow-md"
              >
                <p>
                  PDF cannot be displayed. You can{" "}
                  <a
                    href={lesson.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    download it here
                  </a>
                  .
                </p>
              </object>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-4">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p>Loading PDF...</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Back Button */}
      <motion.div variants={itemVariants} className="mt-8">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition-colors"
          >
            ← Back to Lessons
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
