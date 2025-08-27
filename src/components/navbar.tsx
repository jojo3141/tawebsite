"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const navItems = [
    { name: "Weekly Material", href: "/" },
    { name: "Exam Information", href: "/exam" },
    { name: "Resources", href: "/resources" },
    { name: "Contact", href: "/contact" },
  ];

  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const refs = useRef<HTMLAnchorElement[]>([]);

  const activeIndex = navItems.findIndex(
    (item) => pathname === item.href || (pathname === "/" && item.href === "/")
  );

  useEffect(() => {
    const currentRef = refs.current[activeIndex];
    if (currentRef) {
      const { offsetLeft, offsetWidth } = currentRef;
      setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeIndex]);

  return (
    <nav className="bg-white shadow-md relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 relative">
          {navItems.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              ref={(el) => { refs.current[index] = el!; }}
              className="relative font-medium text-gray-700 hover:text-purple-600 px-3 py-2"
            >
              {item.name}
            </Link>
          ))}

          {/* Sliding underline */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 h-1 bg-purple-700 rounded"
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
