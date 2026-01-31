"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
  
import { clsx } from "clsx";
import { useCourse } from "@/context/CourseContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { course, setCourse } = useCourse();
  
  const navItems = [
    { name: "Algorithm Lab", href: "/algorithms" },
    { name: "Contact & Questions", href: "/contact" },
  ];
  
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
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                    "relative font-medium px-3 py-2 transition-colors",
                    pathname === item.href 
                        ? "text-purple-700" 
                        : "text-gray-700 hover:text-purple-600"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}