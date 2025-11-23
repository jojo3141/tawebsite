"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAlgorithms = pathname === "/algorithms";
  
  return (
    <div 
      className={clsx(
        "min-h-screen w-full flex flex-col transition-colors duration-1000 ease-in-out",
        isAlgorithms ? "bg-slate-950 text-slate-200" : "bg-gray-50 text-gray-900"
      )}
    >
      <main 
        className={clsx(
          "flex-1 flex flex-col transition-all duration-1000",
          isAlgorithms ? "w-full" : "p-6 max-w-[90%] mx-auto w-full pt-24" // Increased width to 90%
        )}
      >
        {children}
      </main>
    </div>
  );
}