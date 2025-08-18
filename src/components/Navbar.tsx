"use client";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "@/store/cartSlice";
import type { RootState } from "@/store/store";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useDispatch();
  const cartCount = useSelector((s: RootState) =>
    s.cart.items.reduce((n, it) => n + it.qty, 0)
  );

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/cart/items", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        dispatch(setCart(data.items || []));
      }
    })();
  }, [dispatch]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Eshop" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top row: grouped logo + desktop nav + search centered, cart + mobile burger right */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6 mx-auto max-w-6xl w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <Image src="/logo.png" alt="Logo" width={80} height={40} />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-lg">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:underline ${
                  pathname === link.href
                    ? "text-orange-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop search */}
          <div className="hidden md:block flex-1 max-w-l">
            <SearchBar />
          </div>
        </div>

        {/* Cart + Mobile burger */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative">
            <svg
              className="w-6 h-6 text-gray-700 hover:text-orange-600 transition"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.5l1.664 12.177a1.5 1.5 0 001.49 1.323h10.132a1.5 1.5 0 001.49-1.323L20.25 6H6.75"
              />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-1.5">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile search always visible under the top row */}
      <div className="px-4 sm:px-6 pb-3 md:hidden">
        <SearchBar />
      </div>

      {/* Mobile dropdown links */}
      {isOpen && (
        <div className="md:hidden border-t bg-white">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-6 py-3 border-b hover:bg-gray-50 ${
                pathname === link.href
                  ? "text-orange-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
