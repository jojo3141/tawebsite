"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type AlgorithmsTheme = "dark" | "light";

interface AlgorithmsThemeContextType {
  theme: AlgorithmsTheme;
  isLight: boolean;
  toggleTheme: () => void;
  setTheme: (theme: AlgorithmsTheme) => void;
}

const AlgorithmsThemeContext = createContext<AlgorithmsThemeContextType | undefined>(undefined);

export function AlgorithmsThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AlgorithmsTheme>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("algorithms_theme") as AlgorithmsTheme;
      if (saved === "dark" || saved === "light") {
        setThemeState(saved);
      }
    } catch {
      // Ignore localStorage access issues if any
    }
  }, []);

  const handleSetTheme = (newTheme: AlgorithmsTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("algorithms_theme", newTheme);
    } catch {
      // Ignore localStorage access issues if any
    }
  };

  const toggleTheme = () => {
    const nextTheme: AlgorithmsTheme = theme === "dark" ? "light" : "dark";
    handleSetTheme(nextTheme);
  };

  const isLight = theme === "light";

  return (
    <AlgorithmsThemeContext.Provider value={{ theme, isLight, toggleTheme, setTheme: handleSetTheme }}>
      {children}
    </AlgorithmsThemeContext.Provider>
  );
}

export function useAlgorithmsTheme() {
  const context = useContext(AlgorithmsThemeContext);
  if (context === undefined) {
    throw new Error("useAlgorithmsTheme must be used within an AlgorithmsThemeProvider");
  }
  return context;
}
