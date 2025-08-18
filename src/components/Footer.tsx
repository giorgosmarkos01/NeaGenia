import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-12">
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
          <h3 className="text-lg font-semibold mb-3 text-orange-500">
            Company
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <a href="/" className="hover:text-gray-900 transition">
                Home
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-gray-900 transition">
                About us
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-gray-900 transition">
                Contact us
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-gray-900 transition">
                Privacy policy
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-orange-500">
            Get in touch
          </h3>
          <p className="text-gray-600 text-sm">
            Email:{" "}
            <a
              href="mailto:info@svkrobotics.com"
              className="text-blue-500 hover:underline"
            >
              info@svkrobotics.com
            </a>
          </p>
          <p className="text-gray-600 text-sm">
            Phone:{" "}
            <a href="tel:+302816008699" className="hover:underline">
              +30 281 600 8699
            </a>
          </p>
          <p className="text-gray-600 text-sm">
            Mobile:{" "}
            <a href="tel:+306947586765" className="hover:underline">
              +30 694 758 6765
            </a>
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
          <h3 className="text-lg font-semibold mb-3 text-orange-500">
            Follow Us
          </h3>
          <div className="flex space-x-4 text-gray-600">
            <a
              href="https://www.facebook.com/profile.php?id=61577812032078&locale=el_GR"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600"
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href="https://www.instagram.com/svk.roboticsgroup/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://www.linkedin.com/company/svk-robotics/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700"
            >
              <FaLinkedinIn size={20} />
            </a>
            <a
              href="https://github.com/SVKROBOTICS"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-500"
            >
              <FaGithub size={20} />
            </a>
            <a
              href="https://www.youtube.com/channel/UCCMymTw3tMX5TtMmOzgZi0g?app=desktop"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600"
            >
              <FaYoutube size={20} />
            </a>
          </div>
        </div>

        {/* Payments */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-orange-500">
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
          <h3 className="text-lg font-semibold mb-3 text-orange-500">
            Shipping Partners
          </h3>
          <div className="flex flex-wrap gap-4">
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

      <div className="border-t border-gray-200">
        <p className="text-center text-sm text-gray-500 py-4">
          ©2025 SVK Robotics. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
