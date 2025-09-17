"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type FormType = "sales" | "tech";

export default function ContactPage() {
  const [formType, setFormType] = useState<FormType>("sales");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          type: formType,
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          ...(formType === "tech" && {
            productCode: formData.get("productCode"),
          }),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setStatus("success");
        e.currentTarget.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-12 text-gray-800">
        <h1 className="text-4xl font-bold mb-6 text-black">Contact Us</h1>

        {/* Dropdown selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            How can we help you?
          </label>
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value as FormType)}
            className="block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="sales">Sales Inquiry</option>
            <option value="tech">Technical Support</option>
          </select>
        </div>

        {/* Dynamic form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              name="name"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium">
              Subject
            </label>
            <input
              name="subject"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Extra field for tech support */}
          {formType === "tech" && (
            <div>
              <label
                htmlFor="productCode"
                className="block text-sm font-medium"
              >
                Product Code (if known)
              </label>
              <input
                name="productCode"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          )}

          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              Message
            </label>
            <textarea
              name="message"
              rows={5}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition"
          >
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>

          {status === "success" && (
            <p className="text-green-600 text-sm mt-2">
              Message sent successfully!
            </p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-sm mt-2">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </main>
      <Footer />
    </>
  );
}
