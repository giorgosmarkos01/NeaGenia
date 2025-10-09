import type { Metadata } from "next";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

export const metadata: Metadata = {
  title: "Cookies Policy | SVK ROBOTICS",
  description: "Learn how SVK Robotics uses cookies and similar technologies.",
};

export default function CookiesPolicyPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto py-12 px-6 text-gray-800 leading-relaxed">
        <h1 className="text-4xl font-bold text-center mb-4">Cookies Policy</h1>
        <p className="text-center text-sm text-gray-500 mb-10">
          <strong>Last updated:</strong> October 15, 2024
        </p>

        <p className="mb-6">
          This Cookies Policy explains how <strong>SVK Robotics</strong> ("we",
          "our", "us") uses cookies and similar technologies when you visit our
          website and e-shop. It also explains your choices regarding cookies.
        </p>

        <p className="mb-6">
          By continuing to browse or use our website, you agree to the use of
          cookies as described in this policy, unless you adjust your browser or
          cookie settings.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">
          1. What Are Cookies?
        </h2>
        <p className="mb-6">
          Cookies are small text files placed on your device when you visit a
          website. They are widely used to make websites work, improve
          efficiency, and provide reporting information. We also use local
          storage and session storage for similar purposes.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">
          2. Types of Cookies We Use
        </h2>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>
            <strong>Essential Cookies:</strong> Enable basic site functionality
            (shopping cart, secure login). Example: Clerk authentication
            cookies. <em>Cannot be opted out.</em>
          </li>
          <li>
            <strong>Performance &amp; Analytics:</strong> Track site usage (e.g.
            Google Analytics). <em>Optional.</em>
          </li>
          <li>
            <strong>Functionality:</strong> Remember preferences (e.g. language,
            currency). <em>Optional.</em>
          </li>
          <li>
            <strong>Marketing &amp; Third-Party:</strong> For ads and campaign
            tracking (e.g. Google Ads, Meta). <em>Optional.</em>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">
          3. Third-Party Cookies
        </h2>
        <p className="mb-4">
          Some cookies are set by third parties such as authentication or
          analytics providers:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>
            Clerk – session and login cookies.{" "}
            <a
              href="https://clerk.com/legal/privacy"
              target="_blank"
              className="text-blue-600 underline"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            Google Analytics – traffic and usage tracking.{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              className="text-blue-600 underline"
            >
              Privacy Policy
            </a>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">
          4. Your Choices About Cookies
        </h2>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>Manage cookies in your browser settings.</li>
          <li>Use cookie banner/preferences if available on our site.</li>
          <li>
            Opt out of Google Analytics with{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              className="text-blue-600 underline"
            >
              Google Opt-out Add-on
            </a>
            .
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">
          5. Updates to This Policy
        </h2>
        <p className="mb-6">
          We may update this Cookies Policy to reflect changes in technology,
          legal requirements, or business practices. Updates will be posted on
          this page with a revised "Last updated" date.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">6. Contact Us</h2>
        <div className="bg-gray-50 border-l-4 border-blue-600 p-4 rounded">
          <p>
            📧 Email:{" "}
            <a
              href="mailto:info@svkrobotics.com"
              className="text-blue-600 underline"
            >
              info@svkrobotics.com
            </a>
            <br />
            📍 Address: Giamalaki 25, 71202, Heraklion, Crete, Greece
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
