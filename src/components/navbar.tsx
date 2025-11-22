"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

export default function Navbar() {
  const pathname = usePathname();
  const navItems = [
    { name: "Weekly Material", href: "/" },
    { name: "Graph Algorithm Visualizer", href: "/algorithms" },
    { name: "Exam & Bonus", href: "/exam" },
    { name: "Useful Resources", href: "/resources" },
    { name: "Contact & Questions", href: "/contact" },
  ];

  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const refs = useRef<HTMLAnchorElement[]>([]);

  const activeIndex = navItems.findIndex(
    (item) => pathname === item.href || (pathname === "/" && item.href === "/")
  );

  const isAlgorithms = pathname === "/algorithms";

  useEffect(() => {
    const currentRef = refs.current[activeIndex];
    if (currentRef) {
      const { offsetLeft, offsetWidth } = currentRef;
      setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeIndex, pathname]);

  return (
    <nav className={clsx(
        "fixed top-0 left-0 right-0 backdrop-blur-md shadow-md z-50 transition-all duration-1000 ease-in-out",
        isAlgorithms ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100 bg-white/70"
    )}>
      <div className="max-w-[90%] mx-auto px-4">
        <div className="flex justify-between items-center h-16 relative">
          {navItems.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              ref={(el) => { refs.current[index] = el!; }}
              className="relative font-medium px-3 py-2 transition-colors text-gray-700 hover:text-purple-600"
            >
              {item.name}
              {item.href === "/algorithms" && (
                <motion.span
                  initial={{ opacity: 1 }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: 4 }}
                  className="absolute -top-2 right-0 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                >
                  New
                </motion.span>
              )}
            </Link>
          ))}

          {/* Sliding underline */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 h-1 rounded bg-purple-700"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
          />
        </div>
      </div>
    </nav>
  );
}