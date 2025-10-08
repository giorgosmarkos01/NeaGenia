"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";
import Image from "next/image";
import Lottie from "lottie-react";
import HeroBannerAnimation from "@/../public/lotties/HeroBanner.json";

const slides = [
  {
    title: "Discover SVK Robotics – Innovation in Education & Technology",
    subtitle: "Empowering the next generation of creators",
    button1: "Visit SVK Robotics",
    button2: "Explore More →",
    link1: "https://svkrobotics.com",
    isLottie: true,
  },
  {
    title: "A variety of ZMROBO Educational Products Available",
    subtitle: "Robotics kits, STEM toys, and more for all ages",
    button1: "Check them out",
    button2: "Learn More →",
    link1: "products?category=educational-kits",
    image: "/ZMROBOHeroBanner.png",
  },
  {
    title: "Check Out Our New Drones!!",
    subtitle: "Next-level flying technology at your fingertips",
    button1: "Shop Drones",
    button2: "See Features →",
    link1: "/products?category=drones#features",
    image: "/HeroBanner.png",
  },
];

export default function HeroBanner() {
  return (
    <section className="max-w-6xl mx-auto px-6 mt-6">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000 }}
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        loop
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="bg-gray-100 rounded-2xl flex flex-col md:flex-row items-center justify-between 
                        px-8 py-8 md:px-14 md:py-10 shadow-lg 
                        h-[550px] md:h-[550px]"   // 👈 Fixed height
            >
              {/* Left Side */}
              <div className="md:w-1/2 space-y-3">
                <p className="title-of-the-product font-semibold text-sm">
                  {slide.subtitle}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                  {slide.title}
                </h1>
                <div className="flex gap-4 mt-4">
                  <Link
                    href={slide.link1}
                    className="add-button text-white px-5 py-2.5 rounded-full title-of-the-product2 transition"
                  >
                    {slide.button1}
                  </Link>
                </div>
              </div>

              {/* Right Side */}
              <div className="mt-6 md:mt-0 md:w-1/2 flex justify-center h-full">
                {slide.isLottie ? (
                  <div className="w-full max-w-lg h-full flex items-center justify-center">
                    <Lottie animationData={HeroBannerAnimation} loop />
                  </div>
                ) : (
                  slide.image && (
                    <Image
                      src={slide.image}
                      alt="Slide Image"
                      width={600}
                      height={600}
                      className="object-contain w-full h-full"
                    />
                  )
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
