"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import SearchBar from "./SearchBar";
import { setCart } from "@/store/cartSlice";

function cn(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();
  const { isSignedIn } = useAuth();

  const count =
    useSelector((s: any) =>
      (s.cart?.items ?? []).reduce(
        (sum: number, it: any) => sum + Number(it.qty || 0),
        0
      )
    ) ?? 0;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const cartRes = await fetch("/api/cart", { cache: "no-store" });
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          if (!cancelled) dispatch(setCart(cartData.items || []));
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, dispatch]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left: burger (mobile) + logo + Home + Products */}
        <div className="flex items-center gap-6">
          {/* burger button only mobile */}
          <button
            aria-label="Toggle menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 text-black md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SVK Robotics"
              width={100}
              height={70}
              className="rounded"
              priority
              style={{ height: "auto", width: "auto" }}
            />
          </Link>

          {/* Desktop Home + Products */}
          <div className="hidden md:flex items-center gap-6 ml-4">
            <Link
              href="/"
              className={cn(
                "text-sm hover:text-orange-600 transition",
                pathname === "/"
                  ? "text-orange-600 font-medium"
                  : "text-zinc-700"
              )}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={cn(
                "text-sm hover:text-orange-600 transition",
                pathname === "/products"
                  ? "text-orange-600 font-medium"
                  : "text-zinc-700"
              )}
            >
              Products
            </Link>
          </div>
        </div>

        {/* Center: SearchBar */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="w-64">
            <SearchBar />
          </div>
        </div>

        {/* Right: About + Contact + User/Cart */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/about"
              className={cn(
                "text-sm hover:text-orange-600 transition",
                pathname === "/about"
                  ? "text-orange-600 font-medium"
                  : "text-zinc-700"
              )}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={cn(
                "text-sm hover:text-orange-600 transition",
                pathname === "/contact"
                  ? "text-orange-600 font-medium"
                  : "text-zinc-700"
              )}
            >
              Contact
            </Link>
          </div>

          {/* User + Cart */}
          <SignedIn>
            <UserButton afterSignOutUrl="/">
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Orders"
                  labelIcon="📦"
                  href="/UserOrderHistory"
                />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center rounded-lg hover:bg-zinc-100 text-black"
            aria-label="Cart"
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
              <path
                d="M3 4h2l2 12a2 2 0 002 2h8a2 2 0 002-2l1-8H6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1" fill="currentColor" />
              <circle cx="18" cy="20" r="1" fill="currentColor" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-semibold leading-4 text-white">
                {count}
              </span>
            )}
          </Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="hidden md:inline text-sm font-medium text-orange-500 hover:text-orange-600 transition">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden border-t transition-[max-height] duration-300 overflow-hidden",
          open ? "max-h-[70vh]" : "max-h-0"
        )}
      >
        <div className="mx-auto max-w-6xl px-4 py-3 space-y-4">
          <SearchBar />
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm hover:bg-zinc-50",
                  pathname === "/" ? "text-orange-600" : "text-zinc-700"
                )}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm hover:bg-zinc-50",
                  pathname === "/products" ? "text-orange-600" : "text-zinc-700"
                )}
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm hover:bg-zinc-50",
                  pathname === "/about" ? "text-orange-600" : "text-zinc-700"
                )}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm hover:bg-zinc-50",
                  pathname === "/contact" ? "text-orange-600" : "text-zinc-700"
                )}
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
