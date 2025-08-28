"use client";

import { motion } from "framer-motion";

export default function ExamPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "tween", duration: 0.4 }}
      className="bg-white shadow-lg rounded-2xl p-8 max-w-4xl mx-auto mt-20"
    >
      <h2 className="text-3xl font-bold mb-6 text-purple-700">Exam & Bonus Points Overview</h2>

      {/* Exam Info */}
      <h3 className="text-xl font-semibold text-purple-600 mb-2">Exams</h3>
      <p className="text-gray-700 mb-6">
        There will be two main exams: a <strong>2-hour theoretical exam</strong> worth 60 points and a 
        <strong> 3-hour programming exam</strong> worth 40 points. More details, including tips for 
        preparation, will be shared later in the semester.
      </p>

      {/* Theory Exercises */}
      <h3 className="text-xl font-semibold text-purple-600 mb-2">Theory Exercises</h3>
      <p className="text-gray-700 mb-6">
        Every three weeks, you will collaborate with one or two partners on weekly assignments. 
        These exercises, released on Mondays, contain both regular and bonus problems. Completing 
        them can earn you up to <strong>3 bonus points per week</strong>.
      </p>

      {/* Peer Grading */}
      <h3 className="text-xl font-semibold text-purple-600 mb-2">Peer Grading</h3>
      <p className="text-gray-700 mb-6">
        After each exercise session, you will be assigned a bonus exercise from another group to 
        review. If you complete the grading and submit your feedback on Moodle the same day, you can 
        earn up to<strong> 1 bonus point</strong>.
      </p>

      {/* Mini Quizzes */}
      <h3 className="text-xl font-semibold text-purple-600 mb-2">Mini Quizzes</h3>
      <p className="text-gray-700 mb-6">
        Starting in week three, a short <strong>Moodle quiz (~5 minutes)</strong> will be held at the 
        beginning of each exercise session. By successfully completing the quiz, you may earn 
        up to <strong>  1 bonus point per week</strong>.
      </p>

      {/* Programming Exercises */}
      <h3 className="text-xl font-semibold text-purple-600 mb-2">Programming Exercises</h3>
      <p className="text-gray-700">
        Likely beginning in week four, two programming tasks will be released on CodeExpert every 
        two weeks. Each completed programming exercise is worth 
        <strong> 3 bonus points</strong>.
      </p>
    </motion.div>
  );
}
