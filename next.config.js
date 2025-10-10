/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"], // ✅ πιο ελαφριές εικόνες
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
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

    // ✅ Custom breakpoints
    deviceSizes: [360, 480, 768, 1024, 1280, 1600, 1920], // για responsive images
    imageSizes: [16, 32, 64, 128, 256, 512], // για icons, avatars, thumbnails
  },

  experimental: {
    legacyBrowsers: false,
    browsersListForSwc: true,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  swcMinify: true,
};

module.exports = nextConfig;
