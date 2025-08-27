"use client";

import { motion } from "framer-motion";

export default function ExamPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{type: "tween", duration: 0.4 }}
      className="bg-white shadow-lg rounded-2xl p-8 max-w-4xl mx-auto"
    >
      <h2 className="text-3xl font-bold mb-4 text-purple-700">Exam Information</h2>
      <p className="text-gray-700 mb-4">
        There will be two separate exams, a theoretical exam (2h, 60 points) and a programming exam (3h, 40 points).
      </p>
      <p className="text-gray-700 mb-4">
        Towards the end of the semester, more information and tips for the exam will follow.
      </p>
      <p className="text-gray-700">
        There will be various types of exercises and "tests" where you can earn bonus points. You can receive up to 0.25 exam points as a bonus if you achieve at least 80% of all possible bonus points.
      </p>
    </motion.div>
  );
}
