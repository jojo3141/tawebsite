import React from "react";
import "./globals.css";
import 'katex/dist/katex.min.css';
import Navbar from "@/components/navbar"; // client component
import MainLayoutWrapper from "@/components/MainLayoutWrapper";
import { CourseProvider } from "@/context/CourseContext";

export const metadata = {
  title: "A&W Exercise Classes",
  description: "Weekly lesson materials",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 flex flex-col min-h-screen">
        <CourseProvider>
          <Navbar />
          <MainLayoutWrapper>{children}</MainLayoutWrapper>
        </CourseProvider>
      </body>
    </html>
  );
}