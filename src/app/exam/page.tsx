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
      <p className="text-gray-700 mb-10">
        Specific programming exercise-related questions must be submitted
        through the Code Expert messaging system. This will also be the only way
        to ask questions during the programming exam.
      </p>
      
      {/* Bonus Points */}
      <h3 className="text-xl font-semibold text-purple-600 mb-2">Bonus Points</h3>
      <p className="text-gray-700 mb-6">
        During the semester, you can earn bonus points for:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
        <li>Solving the designated parts of the theoretical exercise sheets (in working groups); <strong>3 points per exercise sheet</strong></li>
        <li>Peer grading the specified part of the theory sheets (in working groups); <strong>1 point per exercise sheet</strong></li>
        <li>Solving the multiple choice quizzes in the beginning of the exercise class (individually); <strong>1 point per week</strong></li>
        <li>Solving the programming problems (individually); <strong>6 points per exercise sheet</strong></li>
      </ul>
      <p className="text-gray-700 mb-6">
        At the end of the term, the bonus points are translated into a bonus grade between 0 and 0.25. 
        The final grade is the sum of the exam grade and the bonus grade (rounded and capped at 6.0). 
        You already receive the maximal bonus grade (0.25) for achieving 80% of the bonus points. 
        This compensates for possible absences (e.g. illness or military service).
      </p>
      <p className="text-gray-700 mb-6">
        The formula is:{" "}
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
          min(0.25, 0.25 * n_points / (0.8 * max_points))
        </code>
        , where <em>n_points</em> is your number of bonus points, and <em>max_points</em> is the maximal possible bonus points.
      </p>
      <p className="text-gray-700 mb-6">
        Participation in the bonus system is voluntary. It is possible to get a 6.0 without participating.
      </p>
      <p className="text-gray-700">
        Solutions must be submitted by <strong>Sunday, 23:59</strong> and peer graded solutions by{" "}
        <strong>Monday, 23:59</strong>. The exact submission deadlines are visible in the Moodle upload sections.
      </p>
    </motion.div>
  );
}
