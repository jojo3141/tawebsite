"use client";

import { motion } from "framer-motion";
import { LinkIcon } from "@heroicons/react/24/outline";

export default function ResourcesPage() {
  const resources = [
    { 
      name: "Lecture Recordings", 
      link: "https://video.ethz.ch/lectures/d-infk/2025/autumn",
      desc: "– perfect if you want to rewatch a lecture or catch up after oversleeping 😅"
    },
    { 
      name: "Moodle Course", 
      link: "https://moodle-app2.let.ethz.ch/course/view.php?id=23362",
      desc: "– the central hub for exercises, quizzes, and announcements 📚"
    },
    { 
      name: "CodeExpert", 
      link: "https://expert.ethz.ch/",
      desc: "– where you’ll practice your programming skills 💻"
    },
    { 
      name: "Old Exams", 
      link: "https://exams.vis.ethz.ch/",
      desc: "– useful for exam preparation and getting a feel for question styles ✍️"
    },
    { 
      name: "D-INFK Polybox", 
      link: "https://polybox.ethz.ch/index.php/s/WXf1p3ODpDdpnRH?path=%2F",
      desc: "– shared files and additional study materials 📂"
    },
    { 
      name: "D-INFK Discord", 
      link: "https://discord.com/invite/eth-dinfk",
      desc: "– chat with fellow students, ask questions, and share memes 💬"
    },{ 
      name: "Binary Search Trees",
      link: "https://www.cs.usfca.edu/~galles/visualization/BST.html",
      desc: "– interactive visualization of binary search trees 🌳"
    },
    { 
      name: "LeetCode Dynamic Programming Plan",
      link: "https://leetcode.com/studyplan/dynamic-programming/",
      desc: "– practice dynamic programming problems step by step 🔢"
    },
    { 
      name: "CSES Problem Set",
      link: "https://cses.fi/problemset/",
      desc: "– a classic collection of competitive programming problems 🏆"
    },
    { 
      name: "XYQuadrat GitHub Repository",
      link: "https://github.com/XYQuadrat/and-algorithms/tree/main",
      desc: "– contains implementations of many algorithms 📘"
    },
    { 
      name: "Kahoots",
      link: "https://create.kahoot.it/profiles/dfe80786-1eb7-4048-afed-9cf7f2e048a1",
      desc: "– all the Kahoots we did in class"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "tween", duration: 0.4 }}
      className="bg-white shadow-lg rounded-2xl p-8 max-w-4xl mx-auto mt-20"
    >
      <h2 className="text-3xl font-bold mb-6 text-purple-700">Useful Resources</h2>
      <ul className="space-y-4">
        {resources.map((res) => (
          <li key={res.name} className="flex items-start space-x-2">
            <LinkIcon className="w-5 h-5 text-purple-600 mt-1" />
            <span>
              <a
                href={res.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-lg"
              >
                {res.name}
              </a>{" "}
              <span className="text-gray-600">{res.desc}</span>
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
