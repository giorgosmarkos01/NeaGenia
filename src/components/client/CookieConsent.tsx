"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
      setTimeout(() => setAnimate(true), 50);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setAnimate(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setAnimate(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-300 z-50 ${
        animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div
        className="bg-gray-900 text-white px-6 py-5 rounded-t-lg shadow-xl 
                      w-full sm:w-[600px] md:w-[700px] lg:w-[800px] max-w-3xl"
      >
        <p className="text-sm text-gray-200 mb-4">
          We use cookies to improve your experience. Essential cookies are
          always enabled as required by GDPR.{" "}
          <a href="/cookies-policy" className="underline text-blue-400">
            Learn more
          </a>
          .
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={declineCookies}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md text-sm font-medium transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
