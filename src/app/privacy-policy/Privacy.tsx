"use client";

import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

export default function Privacy() {
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto py-12 px-6 text-gray-800 leading-relaxed">
        <h1 className="text-4xl font-bold text-center mb-4">Privacy Policy</h1>
        <p className="text-center text-sm text-gray-500 mb-10">
          <strong>Last updated:</strong> October 15, 2024
        </p>

        <p className="mb-6">
          At <strong>SVK Robotics</strong> (&quot;we&quot;, &quot;our&quot;,
          &quot;us&quot;), we value your privacy and are committed to
          safeguarding your personal data. This Privacy Policy explains how we
          collect, use, and protect your personal information in compliance with
          the General Data Protection Regulation (GDPR) and other applicable
          laws.
        </p>

        {/* Section 1 */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">
          1. Important Information
        </h2>
        <p className="mb-4">
          SVK Robotics specializes in robotics and mechatronics solutions, as
          well as offering products through our online shop. This Privacy Policy
          applies to all users of our website and e-shop.
        </p>
        <div className="bg-gray-50 border-l-4 border-blue-600 p-4 rounded mb-6">
          <p className="font-medium">Contact Information:</p>
          <p>
            📧 Email:{" "}
            <a
              href="mailto:info@svkrobotics.com"
              className="text-blue-600 underline"
            >
              info@svkrobotics.com
            </a>
            <br />
            📍 Address: Giamalaki 25, Heraklion, Crete, Greece
          </p>
        </div>

        {/* Section 2 */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">
          2. Data We Collect
        </h2>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>
            <strong>Identity Data:</strong> Name, username, title, gender.
          </li>
          <li>
            <strong>Contact Data:</strong> Billing and shipping addresses,
            email, phone.
          </li>
          <li>
            <strong>Financial Data:</strong> Payment details (processed securely
            via third parties).
          </li>
          <li>
            <strong>Transaction Data:</strong> Purchases and order history.
          </li>
          <li>
            <strong>Technical Data:</strong> IP address, browser, timezone,
            device information.
          </li>
          <li>
            <strong>Profile Data:</strong> Preferences, account settings,
            feedback.
          </li>
          <li>
            <strong>Usage Data:</strong> Website interactions and navigation.
          </li>
          <li>
            <strong>Marketing Data:</strong> Communication preferences.
          </li>
        </ul>

        {/* Section 3 */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">
          3. How We Collect Data
        </h2>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>
            <strong>Direct interactions:</strong> Information provided when
            creating an account, completing checkout, or contacting us.
          </li>
          <li>
            <strong>Automated technologies:</strong> Cookies, analytics, and
            server logs.
          </li>
          <li>
            <strong>Third parties:</strong> Payment providers, analytics
            platforms, and advertising networks.
          </li>
        </ul>

        {/* Section 4 */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">
          4. How We Use Your Data
        </h2>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>To process and deliver your orders.</li>
          <li>To manage customer relationships and provide support.</li>
          <li>For marketing and promotional purposes (with consent).</li>
          <li>To analyze website performance and improve user experience.</li>
          <li>To comply with legal and regulatory obligations.</li>
        </ul>

        <p className="italic text-gray-700 mb-6">
          <strong>Marketing:</strong> We may send promotional offers if you have
          purchased from us or opted in to receive updates. You can unsubscribe
          at any time.
        </p>

        {/* Section 5 */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">
          5. Sharing Your Data
        </h2>
        <p className="mb-6">
          We may share your information with trusted service providers such as
          payment processors, logistics companies, IT providers, and legal
          advisors. We do not sell your personal data to third parties.
        </p>

        {/* Section 6 */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">
          6. International Transfers
        </h2>
        <p className="mb-6">
          When transferring personal data outside the EEA, we use safeguards
          such as Standard Contractual Clauses to ensure compliance with data
          protection regulations.
        </p>

        {/* Section 7 */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">
          7. Data Security
        </h2>
        <p className="mb-6">
          We use appropriate technical and organizational measures to protect
          your personal data from unauthorized access, disclosure, alteration,
          or destruction. In the event of a data breach, we will notify affected
          users and regulators as required by law.
        </p>

        {/* Section 8 */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">
          8. Data Retention
        </h2>
        <p className="mb-6">
          We only keep your personal data for as long as necessary to fulfill
          the purposes for which it was collected, including legal, accounting,
          or reporting requirements.
        </p>

        {/* Section 9 */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">
          9. Your Rights Under GDPR
        </h2>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>Right to access your personal data.</li>
          <li>Right to request correction or deletion.</li>
          <li>Right to restrict or object to processing.</li>
          <li>Right to data portability.</li>
          <li>Right to withdraw consent at any time.</li>
        </ul>
        <p className="mb-6">
          To exercise your rights, contact us at{" "}
          <a
            href="mailto:info@svkrobotics.com"
            className="text-blue-600 underline"
          >
            info@svkrobotics.com
          </a>
          .
        </p>

        {/* Section 10 */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">
          10. Updates to This Policy
        </h2>
        <p className="mb-6">
          We may update this Privacy Policy from time to time. Any changes will
          be posted on this page with an updated revision date.
        </p>

        {/* Section 11 */}
        <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">
          11. Contact Us
        </h2>
        <div className="bg-gray-50 border-l-4 border-blue-600 p-4 rounded mb-6">
          <p>
            📧 Email:{" "}
            <a
              href="mailto:info@svkrobotics.com"
              className="text-blue-600 underline"
            >
              info@svkrobotics.com
            </a>
            <br />
            📍 Address: Giamalaki 25, Heraklion, Crete, Greece
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
