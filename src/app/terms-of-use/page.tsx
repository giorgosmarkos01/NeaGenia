import type { Metadata } from "next";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

export const metadata: Metadata = {
  title: "Terms of Use | SVK ROBOTICS",
  description:
    "Review the Terms of Use for accessing and using SVK Robotics' website and e-shop.",
};

export default function TermsOfUsePage() {
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto py-12 px-6 text-gray-800 leading-relaxed">
        <h1 className="text-4xl font-bold text-center mb-4">Terms of Use</h1>
        <p className="text-center text-sm text-gray-500 mb-10">
          <strong>Last updated:</strong> October 15, 2024
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">1. Introduction</h2>
        <p className="mb-6">
          Welcome to <strong>SVK Robotics</strong> ("Company", "we", "our",
          "us"). By accessing and using our website, including any related
          subdomains or services offered through the website (collectively, the
          "Site"), you agree to be bound by these Terms of Use ("Terms"). If you
          do not agree with any of these Terms, you should not use the Site.
        </p>

        <p className="mb-6">
          These Terms apply to all visitors, users, and others who access the
          Site or make purchases through our e-shop.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">2. Eligibility</h2>
        <p className="mb-6">
          You must be at least 18 years of age to access and use our Site and
          services. By accessing or using the Site, you represent and warrant
          that you have the legal capacity to enter into a binding agreement
          with us and that you are not barred from using the Site under any
          applicable law.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          3. Intellectual Property
        </h2>
        <p className="mb-6">
          All content, materials, logos, designs, text, images, graphics,
          videos, and other intellectual property on the Site are the exclusive
          property of SVK Robotics or its licensors. You may not use, reproduce,
          distribute, or modify any content from our Site without express
          permission, except as permitted under applicable law.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">4. Use of the Site</h2>
        <ul className="list-disc list-inside mb-6 space-y-1">
          <li>
            Not violate any applicable local, national, or international law.
          </li>
          <li>
            Not engage in fraudulent, misleading, or malicious activities.
          </li>
          <li>
            Not upload or transmit harmful code, viruses, or anything that may
            damage the Site or its services.
          </li>
          <li>
            Not infringe on the intellectual property or privacy of others.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">5. E-Shop Terms</h2>
        <h3 className="text-lg font-semibold mt-4 mb-2">
          5.1 Product Information
        </h3>
        <p className="mb-4">
          We strive for accurate product descriptions, prices, and availability,
          but cannot guarantee they are error-free. We reserve the right to
          correct errors at any time, even after an order is placed.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          5.2 Orders and Payments
        </h3>
        <p className="mb-4">
          Orders must include accurate and current information. We reserve the
          right to cancel orders for unavailability, errors, or suspected fraud.
          Payments are processed securely via third-party gateways. You agree to
          pay all charges including taxes and shipping.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          5.3 Shipping and Delivery
        </h3>
        <p className="mb-4">
          Shipping times vary by location and product. Estimated dates may
          change due to external factors. We are not liable for delays.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          5.4 Returns and Refunds
        </h3>
        <p className="mb-6">
          Returns are accepted under our Return Policy. Refunds are issued to
          the original payment method after inspection of the returned product.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          6. GDPR and Data Protection
        </h2>
        <p className="mb-4">
          SVK Robotics complies with GDPR. By using the Site, you consent to the
          collection, use, and storage of your personal data as outlined in our{" "}
          <a href="/privacy-policy" className="text-blue-600 underline">
            Privacy Policy
          </a>
          .
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          6.1 Your Rights Under GDPR
        </h3>
        <ul className="list-disc list-inside mb-6 space-y-1">
          <li>Access your personal data stored by us.</li>
          <li>Request correction or deletion of your personal data.</li>
          <li>Restrict or object to data processing.</li>
          <li>Withdraw consent at any time.</li>
        </ul>
        <p className="mb-6">
          For inquiries, contact us at{" "}
          <a
            href="mailto:info@svkrobotics.com"
            className="text-blue-600 underline"
          >
            info@svkrobotics.com
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          7. Limitation of Liability
        </h2>
        <p className="mb-6">
          To the fullest extent permitted by law, SVK Robotics is not liable for
          direct, indirect, incidental, or consequential damages from use of the
          Site or services, regardless of legal theory.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">8. Indemnification</h2>
        <p className="mb-6">
          You agree to indemnify and hold harmless SVK Robotics, its affiliates,
          officers, and employees from any claims or damages related to your use
          of the Site or violation of these Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          9. Changes to the Terms
        </h2>
        <p className="mb-6">
          We may update these Terms at any time without prior notice. Continued
          use of the Site after changes indicates acceptance of the updated
          Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">10. Governing Law</h2>
        <p className="mb-6">
          These Terms are governed by the laws of Greece and the European Union.
          Disputes will be subject to the exclusive jurisdiction of the courts
          of Greece.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          11. Contact Information
        </h2>
        <p className="mb-6">
          📧 Email:{" "}
          <a
            href="mailto:info@svkrobotics.com"
            className="text-blue-600 underline"
          >
            info@svkrobotics.com
          </a>
        </p>
      </div>
      <Footer />
    </>
  );
}
