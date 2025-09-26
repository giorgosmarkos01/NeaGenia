"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    title: "Next-Level Gaming Starts Here – Discover PlayStation 5 Today!",
    subtitle: "Hurry up only few lefts!",
    button1: "Shop Now",
    button2: "Explore Deals →",
    image:
      "https://svkroboticsedu.com/uploads/items/2025-06-04-fox_6-Photoroom.jpg",
  },
  {
    title: "Boost Your Robotics Skills – Explore Our Latest Kits!",
    subtitle: "Limited Stock Available!",
    button1: "Browse Kits",
    button2: "Learn More →",
    image:
      "https://svkroboticsedu.com/uploads/items/2025-06-04-fox_6-Photoroom.jpg",
  },
  {
    title: "Upgrade Your Workspace – Get the Best Tools Today!",
    subtitle: "Hot Deals You Can’t Miss!",
    button1: "Shop Tools",
    button2: "Check Offers →",
    image:
      "https://svkroboticsedu.com/uploads/items/2025-06-04-fox_6-Photoroom.jpg",
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 mt-8 overflow-hidden ">
      <div
        className="flex transition-transform duration-700 ease-in-out gap-8"
        style={{ transform: `translateX(-${currentSlide * (100 + 2)}%)` }} // +2% για να καλύψει το gap
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="min-w-full bg-gray-100 rounded-2xl flex flex-col md:flex-row items-center justify-between p-12 md:p-20 shadow-lg"
          >
            {/* Left Side */}
            <div className="md:w-1/2 space-y-4">
              <p className="title-of-the-product font-semibold text-sm">
                {slide.subtitle}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
                {slide.title}
              </h1>
              <div className="flex gap-4 mt-6">
                <button className="add-button text-white px-6 py-3 rounded-full title-of-the-product2 transition">
                  {slide.button1}
                </button>
                <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition">
                  {slide.button2}
                </button>
              </div>
            </div>

            {/* Right Side */}
            {/* <div className="mt-8 md:mt-0 md:w-1/2 flex justify-center">
              <Image
                src={slide.image}
                alt="Slide Image"
                width={400}
                height={400}
                className="object-contain"
              />
            </div> */}
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer transition ${
              index === currentSlide ? "add-button" : "bg-gray-300"
            }`}
            onClick={() => setCurrentSlide(index)}
          ></span>
        ))}
      </div>
    </section>
  );
}
