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
        "min-h-screen w-full flex flex-col",
        isAlgorithms ? "bg-slate-950 text-slate-200" : "bg-gray-50 text-gray-900"
      )}
    >
      <main 
        className={clsx(
          "flex-1 flex flex-col",
          isAlgorithms ? "w-full" : "p-6 max-w-[90%] mx-auto w-full pt-24"
        )}
      >
        {children}
      </main>
    </div>
  );
}