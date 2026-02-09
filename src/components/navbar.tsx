"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
  
import { clsx } from "clsx";
import { FlaskConical } from "lucide-react";
import { useCourse } from "@/context/CourseContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { course, setCourse } = useCourse();
  
  const isAlgorithms = pathname === "/algorithms";

  return (
    <nav className={clsx(
        "fixed top-0 left-0 right-0 backdrop-blur-md shadow-md z-50 transition-all duration-1000 ease-in-out",
        isAlgorithms ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100 bg-white/70"
    )}>
      <div className="max-w-[100%] mx-auto px-4">
        <div className="flex justify-between items-center h-16 relative">
          
          {/* Left Side: Logo & Course Switcher */}
          <div className="flex items-center gap-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600">
                  Josia Heger
                </span>
                <span className="text-gray-300 font-light">|</span>
                <span className="text-gray-600 font-medium">Teaching</span>
              </Link>

              {/* Course Switcher */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                {(['AD', 'AW'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                        setCourse(c);
                        if (pathname !== '/') {
                            router.push('/');
                        }
                    }}
                    className={clsx(
                      "relative px-3 py-1.5 text-xs font-bold rounded-md transition-colors z-0",
                      course === c ? "text-purple-700" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {course === c && (
                      <motion.div
                        layoutId="courseHighlight"
                        className="absolute inset-0 bg-white shadow-sm rounded-md border border-gray-200"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{c === "AD" ? "A&D" : "A&W"}</span>
                  </button>
                ))}
              </div>
          </div>

          {/* Right Side: Navigation Items */}
          <div className="flex items-center gap-4 relative">
            {/* Contact Link */}
            <Link
                href="/contact"
                className={clsx(
                    "relative font-medium px-3 py-2 transition-colors duration-200",
                    pathname === "/contact" 
                        ? "text-purple-700" 
                        : "text-gray-600 hover:text-purple-600"
                )}
            >
                Contact & Questions
            </Link>

            {/* Algorithm Lab CTA */}
            <Link
                href="/algorithms"
                className="group relative inline-flex items-center justify-center"
            >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 rounded-lg text-white font-bold text-sm tracking-wide transition-all duration-200 group-hover:bg-slate-900 group-hover:scale-[1.02]">
                    <FlaskConical className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    <span>Algorithm Lab</span>
                </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}