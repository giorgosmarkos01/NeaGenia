"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaYoutube,
} from "react-icons/fa";

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 relative max-h-[90vh] flex flex-col">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="text-gray-700 space-y-4 text-sm leading-relaxed overflow-y-auto pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [cookiesOpen, setCookiesOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <footer className="border-t border-gray-200 mt-12">
      {/* Top Section */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Logo & Description */}
        <div>
          <Image
            src="/logo.png"
            alt="SVK Robotics Logo"
            width={96}
            height={96}
            className="mb-4 object-contain"
          />
          <p className="text-gray-600 text-sm leading-relaxed">
            SVK Robotics is a company specializing in robotics and mechatronics
            solutions, as well as selling robotics products through our e-shop.
            Our mission is to provide the best products with excellent customer
            service.
          </p>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3 title-of-the-product">
            Company
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link href="/" className="hover:text-gray-900 transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-gray-900 transition">
                About us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gray-900 transition">
                Contact us
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-gray-900 transition">
                Privacy policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-3 title-of-the-product">
            Get in touch
          </h3>
          <p className="text-gray-600 text-sm">
            Email:{" "}
            <Link
              href="mailto:info@svkrobotics.com"
              className="text-blue-500 hover:underline"
            >
              info@svkrobotics.com
            </Link>
          </p>
          <p className="text-gray-600 text-sm">
            Phone:{" "}
            <Link href="tel:+302816008699" className="hover:underline">
              +30 281 600 8699
            </Link>
          </p>

          <p className="mt-4 text-gray-600 text-sm">
            GIAMALAKI 25, 71202, Heraklion, Crete, Greece
          </p>
        </div>
      </div>

      {/* Follow Us / Payments / Shipping */}
      <div className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Follow Us */}
        <div>
          <h3 className="text-lg font-semibold mb-3 title-of-the-product">
            Follow Us
          </h3>
          <div className="flex space-x-4 text-gray-600">
            <Link
              href="https://www.facebook.com/profile.php?id=61577812032078&locale=el_GR"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600"
            >
              <FaFacebookF size={20} />
            </Link>
            <Link
              href="https://www.instagram.com/svk.roboticsgroup/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500"
            >
              <FaInstagram size={20} />
            </Link>
            <Link
              href="https://www.linkedin.com/company/svk-robotics/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700"
            >
              <FaLinkedinIn size={20} />
            </Link>
            <Link
              href="https://github.com/SVKROBOTICS"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-500"
            >
              <FaGithub size={20} />
            </Link>
            <Link
              href="https://www.youtube.com/channel/UCCMymTw3tMX5TtMmOzgZi0g?app=desktop"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600"
            >
              <FaYoutube size={20} />
            </Link>
          </div>
        </div>

        {/* Payments */}
        <div>
          <h3 className="text-lg font-semibold mb-3 title-of-the-product">
            Accepted Payments
          </h3>
          <div className="flex flex-wrap gap-4">
            <Image src="/payments/visa.svg" alt="Visa" width={50} height={30} />
            <Image
              src="/payments/mastercard.svg"
              alt="Mastercard"
              width={50}
              height={30}
            />
            <Image
              src="/payments/applepay.svg"
              alt="Apple Pay"
              width={50}
              height={30}
            />
            <Image
              src="/payments/viva.svg"
              alt="Viva Wallet"
              width={50}
              height={30}
            />
          </div>
        </div>

        {/* Shipping */}
        <div>
          <h3 className="text-lg font-semibold mb-3 title-of-the-product">
            Shipping Partners
          </h3>
          <div className="flex flex-wrap gap-4 items-center">
            <Image src="/shipping/elta.png" alt="ELTA" width={50} height={30} />
            <Image
              src="/shipping/fedex.svg"
              alt="FedEx"
              width={50}
              height={30}
            />
            <Image
              src="/shipping/boxnow.jpg"
              alt="BoxNow"
              width={50}
              height={30}
            />
          </div>
        </div>
      </div>

      {/* Global Services Section */}
      <div className="border-t border-gray-200 bg-gray-50 mt-20 mb-20">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {/* Worldwide Shipping */}
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="mx-auto h-8 w-8 title-of-the-product mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm0 0v9l6 3"
              />
            </svg>
            <h4 className="font-semibold text-gray-800">Worldwide Shipping</h4>
            <p className="text-sm text-gray-600 mt-1">
              Reliable global delivery with trusted logistics partners.
            </p>
          </div>

          {/* Reliability */}
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="mx-auto h-8 w-8 title-of-the-product mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 className="font-semibold text-gray-800">Reliability</h4>
            <p className="text-sm text-gray-600 mt-1">
              High-quality products tested for durability and performance.
            </p>
          </div>

          {/* Technical Support */}
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="mx-auto h-8 w-8 title-of-the-product mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-3-3v6m9-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 className="font-semibold text-gray-800">Technical Support</h4>
            <p className="text-sm text-gray-600 mt-1">
              Dedicated assistance for hardware &amp; integration challenges.
            </p>
          </div>

          {/* Software & Hardware Assistance */}
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="mx-auto h-8 w-8 title-of-the-product mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
            <h4 className="font-semibold text-gray-800">
              Software &amp; Hardware Support
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Full lifecycle support from firmware to mechanical parts.
            </p>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <div className="max-w-4xl mx-auto px-6 pb-10 mt-8">
        <div className="aspect-w-16 aspect-h-9 rounded overflow-hidden shadow-lg mb-8">
          <iframe
            title="Headquarters Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3254.661999375163!2d25.12713700545938!3d35.33921399196639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x149a5be3fb80294d%3A0xc0213651a2186700!2sSVK%20ROBOTICS!5e0!3m2!1sen!2sgr!4v1739177847327!5m2!1sen!2sgr"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full border-0"
          />
        </div>
      </div>

      {/* Bottom Bar with Modals */}
      <div className="border-t border-gray-200 flex flex-col sm:flex-row justify-center items-center gap-4 py-4">
        <p className="text-center text-sm text-gray-500">
          ©2025 SVK Robotics. All rights reserved.
        </p>

        <div className="flex gap-6">
          <button
            onClick={() => setCookiesOpen(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Cookies Policy
          </button>
          <button
            onClick={() => setTermsOpen(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Privacy Policy
          </button>
        </div>
      </div>

      {/* Cookies Modal */}
      <Modal
        isOpen={cookiesOpen}
        onClose={() => setCookiesOpen(false)}
        title="Cookies Policy"
      >
        <p>
          <strong>Last updated:</strong> October 15, 2024
        </p>

        <p>
          This Cookies Policy explains how <strong>SVK Robotics</strong>{" "}
          (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) uses cookies and
          similar technologies when you visit our website and e-shop. It also
          explains your choices regarding cookies.
        </p>

        <p>
          By continuing to browse or use our website, you agree to the use of
          cookies as described in this policy, unless you adjust your browser or
          cookie settings.
        </p>

        <h3 className="font-semibold text-gray-900 mt-4">
          1. What Are Cookies?
        </h3>
        <p>
          Cookies are small text files placed on your device when you visit a
          website. They are widely used to make websites work, improve
          efficiency, and provide reporting information. We also use local
          storage and session storage for similar purposes.
        </p>

        <h3 className="font-semibold text-gray-900 mt-4">
          2. Types of Cookies We Use
        </h3>
        <ul className="list-disc list-inside space-y-2">
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

        <h3 className="font-semibold text-gray-900 mt-4">
          3. Third-Party Cookies
        </h3>
        <p>
          Some cookies are set by third parties such as authentication or
          analytics providers:
        </p>
        <ul className="list-disc list-inside space-y-1">
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

        <h3 className="font-semibold text-gray-900 mt-4">
          4. Your Choices About Cookies
        </h3>
        <ul className="list-disc list-inside space-y-1">
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

        <h3 className="font-semibold text-gray-900 mt-4">
          5. Updates to This Policy
        </h3>
        <p>
          We may update this Cookies Policy to reflect changes in technology,
          legal requirements, or business practices. Updates will be posted here
          with a revised &quot;Last updated&quot; date.
        </p>

        <h3 className="font-semibold text-gray-900 mt-4">6. Contact Us</h3>
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
      </Modal>

      {/* Privacy Modal */}
      <Modal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        title="Privacy Policy"
      >
        <p>
          <strong>Last updated:</strong> October 15, 2024
        </p>

        <p>
          <strong>SVK Robotics</strong> (&quot;we&quot;, &quot;our&quot;,
          &quot;us&quot;) respects your privacy and is committed to protecting
          your personal data. This privacy policy explains how we handle your
          personal information, your privacy rights, and how the law protects
          you, particularly under GDPR.
        </p>

        <h3 className="font-semibold text-gray-900">
          1. Important Information and Who We Are
        </h3>
        <p>
          SVK Robotics specializes in robotics and mechatronics solutions, as
          well as selling products through our e-shop. This privacy policy
          applies to the use of our website and e-shop.
        </p>
        <p>
          <strong>Contact Information:</strong>
          <br />
          📧 Email:{" "}
          <a
            href="mailto:info@svkrobotics.com"
            className="text-blue-600 underline"
          >
            info@svkrobotics.com
          </a>
          <br />
          📍 Address: Ραδαμάνθους 18, Heraklion, Crete, Greece
        </p>

        <h3 className="font-semibold text-gray-900">2. What Data We Collect</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Identity Data:</strong> Name, username, title, gender.
          </li>
          <li>
            <strong>Contact Data:</strong> Billing, delivery address, email,
            phone.
          </li>
          <li>
            <strong>Financial Data:</strong> Card details (via secure
            processors).
          </li>
          <li>
            <strong>Transaction Data:</strong> Payments and purchases.
          </li>
          <li>
            <strong>Technical Data:</strong> IP, browser, timezone, device info.
          </li>
          <li>
            <strong>Profile Data:</strong> Orders, preferences, feedback.
          </li>
          <li>
            <strong>Usage Data:</strong> Website interactions.
          </li>
          <li>
            <strong>Marketing Data:</strong> Preferences for communication.
          </li>
        </ul>

        <h3 className="font-semibold text-gray-900">3. How We Collect Data</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Direct:</strong> Forms, account creation, checkout, emails.
          </li>
          <li>
            <strong>Automated:</strong> Cookies, server logs, analytics.
          </li>
          <li>
            <strong>Third Parties:</strong> Analytics, ad networks, search info.
          </li>
        </ul>

        <h3 className="font-semibold text-gray-900">4. How We Use Data</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>To perform contracts (e.g. process orders).</li>
          <li>For legitimate interests (marketing, analytics).</li>
          <li>To comply with legal obligations.</li>
        </ul>
        <p>
          <strong>Marketing:</strong> You may receive offers if you’ve purchased
          from us or signed up for promotions.
        </p>

        <h3 className="font-semibold text-gray-900">5. Disclosures of Data</h3>
        <p>
          We may share data with service providers, legal advisors, payment
          processors, marketing platforms, or authorities.
        </p>

        <h3 className="font-semibold text-gray-900">
          6. International Transfers
        </h3>
        <p>
          We may transfer data outside the EEA under Standard Contractual
          Clauses.
        </p>

        <h3 className="font-semibold text-gray-900">7. Data Security</h3>
        <p>
          We use safeguards to prevent unauthorized access, and notify
          regulators/users if a breach occurs.
        </p>

        <h3 className="font-semibold text-gray-900">8. Data Retention</h3>
        <p>
          We retain data only as long as necessary for business or legal needs.
        </p>

        <h3 className="font-semibold text-gray-900">9. Your Rights (GDPR)</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Access, correct, or delete your data.</li>
          <li>Object to processing or restrict usage.</li>
          <li>Request data transfer.</li>
          <li>Withdraw consent at any time.</li>
        </ul>
        <p>
          Contact us at{" "}
          <a
            href="mailto:info@svkrobotics.com"
            className="text-blue-600 underline"
          >
            info@svkrobotics.com
          </a>{" "}
          to exercise these rights.
        </p>

        <h3 className="font-semibold text-gray-900">10. Changes</h3>
        <p>
          We may update this Privacy Policy from time to time. Please review
          periodically.
        </p>

        <h3 className="font-semibold text-gray-900">11. Contact Details</h3>
        <p>
          📧 Email:{" "}
          <a
            href="mailto:info@svkrobotics.com"
            className="text-blue-600 underline"
          >
            info@svkrobotics.com
          </a>
          <br />
          📍 Address: Ραδαμάνθους 18, Heraklion, Crete, Greece
        </p>
      </Modal>
    </footer>
  );
}
