"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAlgorithms = pathname === "/algorithms";

  return (
    <AnimatePresence mode="popLayout" onExitComplete={() => window.scrollTo(0, 0)}>
      <motion.div
        key={pathname}
        initial={isAlgorithms ? { opacity: 0, scale: 0.95, filter: "blur(10px)" } : { opacity: 1 }}
        animate={isAlgorithms ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 1 }}
        exit={isAlgorithms ? { opacity: 0, scale: 0.95, filter: "blur(10px)" } : { opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
