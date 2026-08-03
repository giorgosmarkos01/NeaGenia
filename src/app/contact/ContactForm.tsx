"use client";

import { useState } from "react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import Lottie from "lottie-react";
import ContactAnimation from "@/../public/lotties/Contact.json";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-col md:flex-row justify-center items-center gap-10 px-6 py-12 bg-white">
        {/* 👇 Lottie Animation */}
        <div className="hidden md:block w-full max-w-sm">
          <Lottie animationData={ContactAnimation} loop={true} />
        </div>

        {/* 👇 Contact Form */}
        <div className="text-black rounded-2xl shadow-lg p-8 w-full max-w-2xl border border-gray-200 bg-white">
          <h2 className="text-3xl font-bold mb-2 text-[#062A56]">Contact Us</h2>
          <p className="text-gray-600 mb-8">
            Fill out the form and we’ll get back to you.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Name */}
            <div>
              <label className="block mb-2 text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full bg-white text-black py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-[#F75807] focus:ring-2 focus:ring-[#F75807] transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-white text-black py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-[#F75807] focus:ring-2 focus:ring-[#F75807] transition-all"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block mb-2 text-sm font-medium">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full bg-white text-black py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-[#F75807] focus:ring-2 focus:ring-[#F75807] transition-all"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block mb-2 text-sm font-medium">Message</label>
              <textarea
                name="message"
                rows={6}
                value={form.message}
                onChange={handleChange}
                required
                className="w-full bg-white text-black py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-[#F75807] focus:ring-2 focus:ring-[#F75807] transition-all resize-none"
              />
            </div>

            {/* Feedback */}
            {status === "success" && (
              <p className="text-green-600 font-semibold">
                ✅ Message sent successfully!
              </p>
            )}
            {status === "error" && (
              <p className="text-red-600 font-semibold">
                ❌ Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-[#F75807] hover:bg-[#D24B06] py-3 px-6 rounded-lg text-white font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
