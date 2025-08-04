export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Logo & Description */}
        <div>
          <h2 className="text-2xl font-bold text-blue-600 mb-3">
            SVK Robotics
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            we will write here something about the company, its values, and what
            it stands for. Our mission is to provide the best online shopping
            experience with quality products and excellent customer service.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Company</h3>
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
          <h3 className="text-lg font-semibold mb-3">Get in touch</h3>
          <p className="text-gray-600 text-sm">+30 6949 582 989</p>
          <p className="text-gray-600 text-sm">svkroboticsedu@gmail.com</p>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-8">
        <p className="text-center text-sm text-gray-500 py-4">
          Copyright 2025 © Efthumis no Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
