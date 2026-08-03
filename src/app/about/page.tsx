"use client";

import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import Lottie from "lottie-react";
import { CheckCircle2 } from "lucide-react";
import AboutAnimation from "@/../public/lotties/About.json";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12 text-gray-800">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <h1 className="text-4xl font-bold text-[#062A56]">
            About Nea Genia Technologies
          </h1>
          <div className="w-32 h-32 md:w-40 md:h-40">
            <Lottie animationData={AboutAnimation} loop={true} />
          </div>
        </div>

        <section className="space-y-6 leading-relaxed">
          <p>
            <strong className="text-[#F75807]">Nea Genia Technologies </strong>
            is an innovative company focused on robotics and technology
            education. Our mission is to empower creativity, inspire
            innovation, and promote hands-on technical knowledge for the next
            generation of thinkers, makers, and problem solvers.
          </p>

          <p>
            Through carefully selected robotics kits, hands-on workshops, and
            STEM products, we aim to help students, teachers, and educational
            institutions explore the world of technology, programming, and
            engineering in an engaging and interactive way.
          </p>

          <p>
            We collaborate with schools, educational organizations, and training
            centers across Greece, offering materials and support for programs
            in robotics, artificial intelligence, and automation.
          </p>

          <p>
            At <strong className="text-[#F75807]">Nea Genia Technologies</strong>,
            we believe education should be accessible, modern, and
            future-ready. That&apos;s why we continuously invest in innovation,
            educational resources, and partnerships with leading suppliers in
            the tech education space.
          </p>
        </section>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-1 text-[#062A56]">
            What We Offer
          </h2>
          <div className="h-1 w-16 bg-[#F75807] rounded-full mb-4" />
          <ul className="space-y-3 text-gray-700">
            {[
              "Educational robotics kits for all age groups",
              "STEM and Arduino tools for hands-on school projects",
              "Support and consulting for educators",
              "Organized workshops and custom learning programs",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#F75807] mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 rounded-xl border-l-4 border-[#F75807] bg-orange-50/50 px-5 py-4">
          <p className="text-gray-700 italic">
            We&apos;re here to make learning technology more fun, practical, and
            future-focused!
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
