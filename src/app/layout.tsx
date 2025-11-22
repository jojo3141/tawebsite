import "./globals.css";
import Navbar from "@/components/navbar"; // client component
import MainLayoutWrapper from "@/components/MainLayoutWrapper";

export const metadata = {
  title: "A&D Exercise Classes",
  description: "Weekly lesson materials",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 flex flex-col min-h-screen">
        <Navbar />
        <MainLayoutWrapper>{children}</MainLayoutWrapper>
      </body>
    </html>
  );
}