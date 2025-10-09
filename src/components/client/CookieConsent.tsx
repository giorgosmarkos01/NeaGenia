"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white px-6 py-4 shadow-lg z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-200">
          Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σου. Τα
          απαραίτητα cookies είναι υποχρεωτικά σύμφωνα με τον GDPR. Μάθε
          περισσότερα στην{" "}
          <a href="/cookies-policy" className="underline text-blue-400">
            Cookies Policy
          </a>
          .
        </p>
        <button
          onClick={acceptCookies}
          className="px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition"
        >
          Αποδοχή
        </button>
      </div>
    </div>
  );
}
