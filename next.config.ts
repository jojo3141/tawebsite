import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // <- Hier aktivierst du den statischen Export
  // optional: weitere Konfigurationsoptionen hier
  basePath: "/~jheger",
  assetPrefix: "/~jheger/",
  
};

export default nextConfig;
