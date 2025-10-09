/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow Next/Image to optimize images from these locations
    remotePatterns: [
      // DEV: if you ever use absolute http://localhost:3000/uploads/... in dev
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      // PROD: direct files from your server
      {
        protocol: "https",
        hostname: "svkroboticstore.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.svkroboticstore.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;
