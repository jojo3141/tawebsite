"use client";

import { motion } from "framer-motion";

export default function ResourcesPage() {
  const resources = [
    { name: "Moodle Course", link: "https://moodle-app2.let.ethz.ch/course/view.php?id=23362" },
    { name: "CodeExpert", link: "https://expert.ethz.ch/" },
    { name: "Lecture Recordings", link: "https://video.ethz.ch" },
    { name: "Old Exams", link: "https://exams.vis.ethz.ch/" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{type: "tween", duration: 0.4 }}
      className="bg-white shadow-lg rounded-2xl p-8 max-w-4xl mx-auto"
    >
      <h2 className="text-3xl font-bold mb-6 text-purple-700">Resources</h2>
      <ul className="space-y-4">
        {resources.map((res) => (
          <li key={res.name}>
            <a
              href={res.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-lg"
            >
              {res.name}
            </a>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
