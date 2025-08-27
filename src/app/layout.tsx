import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "My Course",
  description: "Weekly lesson materials",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <nav className="flex justify-between items-center p-4 shadow-md bg-white">
          <h1 className="text-xl font-bold">📚 My Course</h1>
          <div className="space-x-4">
            <Link href="/">Home</Link>
            <Link href="/lessons">Lessons</Link>
            <Link href="/resources">Resources</Link>
          </div>
        </nav>
        <main className="p-6 max-w-4xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
