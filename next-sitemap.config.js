/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://neageniatechnologies.com",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: [
    "/cart",
    "/checkout",
    "/success",
    "/userorderhistory",
    "/api/*",
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cart", "/checkout", "/success", "/userorderhistory", "/api/*"],
      },
    ],
  },
};