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
      <h2 className="text-3xl font-bold mb-6 text-purple-700">
        Exercise Classes and Bonus Points Overview
      </h2>

      {/* Exercise Classes and Theory Exercises */}
      <h3 className="text-xl font-semibold text-purple-600 mb-2">
        Exercise Classes and Theory Exercises
      </h3>
      <p className="text-gray-700 mb-6">
        Every Monday (starting from <strong>22.09.2025</strong>) we will publish
        a new theory exercise sheet on the webpage, and you have one week to
        solve the exercises. All sheets are written in English, but you can hand
        in your solutions in either English or German.
      </p>
      <p className="text-gray-700 mb-6">
        The first exercise class takes place on{" "}
        <strong>Monday, 22.09.2025</strong>. It is important to attend since
        your teaching assistant (TA) will assign you to working groups of 2–3
        people. Within these groups, you will solve exercises together and
        submit one group solution via Moodle until
        <strong> Sunday, 23:59</strong> of the same week. For example, if sheet
        1 is published on 22.09.2025, solutions must be submitted by 28.09.2025
        at 23:59. Working groups are reassigned every 3 weeks.
      </p>

      {/* Peer Grading */}
      <h3 className="text-xl font-semibold text-purple-600 mb-2">
        Peer Grading
      </h3>
      <p className="text-gray-700 mb-6">
        During the last hour of each exercise class you will peer grade the
        solutions of your fellow students. The TA distributes the solutions, and
        each group reviews the work of another group. You should comment on
        incorrect or incomplete parts, providing clear explanations. Peer
        grading must be submitted on Moodle
        <strong> the same day</strong>.
      </p>
      <p className="text-gray-700 mb-6">
        The purpose of peer grading is twofold: to give you more feedback from
        peers in addition to the TA, and to help you learn what makes a solution
        clear and well-written.
      </p>

      {/* Moodle Submissions */}
      <h3 className="text-xl font-semibold text-purple-600 mb-2">
        Submissions on Moodle
      </h3>
      <p className="text-gray-700 mb-6">
        To submit your solutions or peer grading, upload them in the
        corresponding Moodle section. Only one student per group needs to
        submit. If you encounter problems with Moodle submissions, please
        contact{" "}
        <a
          href="mailto:ad-organisation@inf.ethz.ch"
          className="text-purple-600 underline"
        >
          ad-organisation@inf.ethz.ch
        </a>
        .
      </p>

      {/* Moodle Quizzes */}
      <h3 className="text-xl font-semibold text-purple-600 mb-2">
        Moodle Quizzes
      </h3>
      <p className="text-gray-700 mb-6">
        Starting from <strong>week 3</strong>, short quizzes on Moodle will take
        place at the beginning of the exercise class. These quizzes prepare you
        for the exam and follow a similar style. You can earn
        <strong> 1 bonus point per week</strong> by completing them. All lecture
        material is relevant, with a focus on the last 2 weeks.
      </p>
      <p className="text-gray-700 mb-6">
        Quizzes are only available between <strong>09:15 – 09:30</strong>. Be on
        time: if you arrive at 09:27, you will only have 3 minutes. If you
        cannot attend in person, you can also join via the Zoom link provided
        above.
      </p>

      {/* Programming Exercises */}
      <h3 className="text-xl font-semibold text-purple-600 mb-2">
        Programming Exercises
      </h3>
      <p className="text-gray-700 mb-6">
        There will be programming exercises in Java. If needed, an optional
        introduction to Java programming is available online (not part of the
        course). The online judging system is{" "}
        <a
          href="https://expert.ethz.ch/"
          target="_blank"
          className="text-purple-600 underline"
        >
          Code Expert
        </a>
        . Warm-up exercises will be provided to test the environment, but they
        do not give bonus points. More details and access will be provided a few
        weeks after the semester starts.
      </p>
      <p className="text-gray-700 mb-6">
        Each programming exercise sheet must be submitted within{" "}
        <strong>two weeks</strong>. The first sheet will be published a few
        weeks into the semester, and then every two weeks thereafter.
      </p>
      <p className="text-gray-700">
        Specific programming exercise-related questions must be submitted
        through the Code Expert messaging system. This will also be the only way
        to ask questions during the programming exam.
      </p>
    </motion.div>
  );
}
