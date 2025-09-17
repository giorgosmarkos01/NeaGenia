"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12 text-gray-800">
        <h1 className="text-4xl font-bold mb-6 text-black">
          About SVK Robotics
        </h1>

        <section className="space-y-6 leading-relaxed">
          <p>
            <strong>SVK Robotics</strong> is an innovative company focused on
            robotics and technology education. Our mission is to empower
            creativity, inspire innovation, and promote hands-on technical
            knowledge for the next generation of thinkers, makers, and problem
            solvers.
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
            At SVK Robotics, we believe education should be accessible, modern,
            and future-ready. That&apos;s why we continuously invest in
            innovation, educational resources, and partnerships with leading
            suppliers in the tech education space.
          </p>
        </section>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-3 text-black">
            What We Offer
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Educational robotics kits for all age groups</li>
            <li>STEM and Arduino tools for hands-on school projects</li>
            <li>Support and consulting for educators</li>
            <li>Organized workshops and custom learning programs</li>
          </ul>
        </div>

        <div className="mt-10">
          <p className="text-gray-600 italic">
            We&apos;re here to make learning technology more fun, practical, and
            future-focused!
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
