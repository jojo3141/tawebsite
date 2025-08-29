/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // This tells Next.js to build static HTML for all pages
  images: {
    unoptimized: true, // required if you have <Image /> but no image loader
  },
}

module.exports = nextConfig
