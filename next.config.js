/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"], // πιο ελαφριές εικόνες
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
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

    deviceSizes: [360, 480, 768, 1024, 1280, 1600, 1920],
    imageSizes: [16, 32, 64, 128, 256, 512],
  },

  experimental: {
    // 👇 μόνο αυτό χρειάζεται σε Next 15
    browsersListForSwc: true,
  },

  compiler: {
    // σβήνει όλα τα console.log στο production
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
