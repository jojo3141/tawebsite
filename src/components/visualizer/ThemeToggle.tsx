"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { clsx } from "clsx";
import { useAlgorithmsTheme } from "@/context/AlgorithmsThemeContext";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, size = "md" }) => {
  const { theme, toggleTheme } = useAlgorithmsTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      id="algorithms-theme-toggle"
      data-testid="algorithms-theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={clsx(
        "relative flex items-center justify-center transition-all duration-200 cursor-pointer select-none group",
        size === "sm" ? "p-1.5 rounded-lg" : "p-2.5 rounded-xl",
        isDark 
          ? "bg-slate-900/60 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 hover:border-slate-700 shadow-sm" 
          : "bg-white/90 hover:bg-white text-indigo-600 hover:text-indigo-700 border border-slate-200 hover:border-slate-300 shadow-sm",
        className
      )}
    >
      {isDark ? (
        <Sun 
          size={size === "sm" ? 17 : 20} 
          className="transition-transform duration-300 group-hover:rotate-45" 
        />
      ) : (
        <Moon 
          size={size === "sm" ? 17 : 20} 
          className="transition-transform duration-300 group-hover:-rotate-12" 
        />
      )}
    </button>
  );
};

export default ThemeToggle;
