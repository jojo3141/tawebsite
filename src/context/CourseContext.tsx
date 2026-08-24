"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Course } from "@/data/lessons";

interface CourseContextType {
  course: Course;
  setCourse: (course: Course) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [course, setCourse] = useState<Course>("AD");

  useEffect(() => {
    const saved = localStorage.getItem("selectedCourse") as Course;
    if (saved === "AD" || saved === "AW") {
      setCourse(saved);
    }
  }, []);

  const handleSetCourse = (c: Course) => {
    setCourse(c);
    localStorage.setItem("selectedCourse", c);
  };

  // Prevent mismatch during hydration by returning simple AD or waiting for mount.
  // Ideally, we just render, but since this affects what's shown, a little layout shift is better than a hydration error.
  
  return (
    <CourseContext.Provider value={{ course, setCourse: handleSetCourse }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
}
