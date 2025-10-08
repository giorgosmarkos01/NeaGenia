
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // DEV
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      // PROD
      {
        protocol: "https",
        hostname: "svkroboticstore.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.svkroboticstore.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    // In prod, proxy /uploads/* → CDN
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/uploads/:path*",
          destination: "https://svkroboticstore.com/uploads/:path*",
        },
      ];
    }
    return [];
  },

  turbopack: {
    root: path.join(__dirname),
  },
};

module.exports = nextConfig;
