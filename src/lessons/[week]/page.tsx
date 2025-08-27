"use client";

import { useParams } from "next/navigation";
import { lessons } from "@/data/lessons";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LessonDetailPage() {
  const { week } = useParams();
  const lesson = lessons.find((l) => l.week === Number(week));

  if (!lesson) return <p className="text-center mt-20 text-gray-600">Lesson not found</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10"
    >
      <h2 className="text-3xl font-bold mb-4 text-purple-700">
        Week {lesson.week} – {lesson.title}
      </h2>
      <p className="text-gray-700 mb-6">{lesson.description}</p>

      {lesson.pdf && (
        <a
          href={lesson.pdf}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mb-8 text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
        >
          Download PDF
        </a>
      )}
      {/* Back Button */}
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
  );
}
