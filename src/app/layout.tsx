import React from "react";
import "./globals.css";
import 'katex/dist/katex.min.css';
import Navbar from "@/components/navbar"; // client component
import MainLayoutWrapper from "@/components/MainLayoutWrapper";

export const metadata = {
  title: "A&D Exercise Classes",
  description: "Weekly lesson materials",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 flex flex-col min-h-screen">
        <Navbar />
        <MainLayoutWrapper>{children}</MainLayoutWrapper>
      </body>
    </html>
  );
}