"use client";

import { lessons } from "@/data/lessons";
import { motion } from "framer-motion";
import Link from "next/link";

// When Copying this file, update LessonsXPage and l.week === X

export default function Lesson3Page() {
  const lesson = lessons.find(l => l.week === 3);

  if (!lesson) {
    return <p className="text-center mt-20 text-gray-600">Lesson not found</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10"
    >
      {/* Title */}
      <h2 className="text-3xl font-bold mb-6 text-purple-700">
        Week {lesson.week} – {lesson.title}
      </h2>

      {/* Description */}
      <p className="mb-6">{lesson.description}</p>

      {/* PDF Viewer */}
      {lesson.pdf && (
        <>
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
        </>
      )}

      {/* Back Button */}
      <div className="mt-8">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition-colors"
          >
            ← Back to Lessons
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}