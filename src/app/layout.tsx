import "./globals.css";
import Navbar from "@/components/navbar"; // client component

export const metadata = {
  title: "A&D Exercise Classes",
  description: "Weekly lesson materials",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Navbar />
        <main className="p-6 max-w-6xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
