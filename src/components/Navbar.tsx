"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux"; // NEW
import { useEffect, useState } from "react"; // NEW
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs"; // (client hook)
import SearchBar from "./SearchBar";
import { clearCart, setCart } from "@/store/cartSlice"; // NEW
import { setWishlist, clearWishlist } from "@/store/wishlistSlice";

function cn(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch(); // NEW
  const { isSignedIn } = useAuth(); // NEW

  // cart count
  const count =
    useSelector((s: any) =>
      (s.cart?.items ?? []).reduce(
        (sum: number, it: any) => sum + Number(it.qty || 0),
        0
      )
    ) ?? 0;

  // ⬇️ Sync cart όταν αλλάζει το auth state (sign-in / sign-out)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!isSignedIn) {
          // dispatch(clearCart());
          //dispatch(clearWishlist());
          return;
        }

        const [cartRes, wishlistRes] = await Promise.all([
          fetch("/api/cart", { cache: "no-store" }),
          fetch("/api/wishlist", { cache: "no-store" }),
        ]);

        if (cartRes.ok) {
          const cartData = await cartRes.json();
          if (!cancelled) dispatch(setCart(cartData.items || []));
        }

        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          const ids = wishlistData.map((item: any) => item.product_id);
          if (!cancelled) dispatch(setWishlist(ids));
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, dispatch]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:grid md:grid-cols-3 md:gap-3 md:px-6">
        {/* Left: burger (mobile) + logo */}
        <div className="flex items-center gap-3">
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

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SVK Robotics"
              width={100}
              height={70}
              className="rounded"
              priority
            />
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-6 ml-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "text-sm hover:text-orange-600 transition",
                    pathname === l.href
                      ? "text-orange-600 font-medium"
                      : "text-zinc-700"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop searchbar in center */}
        <div className="hidden md:flex justify-center">
          <SearchBar />
        </div>

        {/* Right: avatar + cart + sign in */}
        <div className="ml-auto flex items-center gap-3">
          {/* <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn> */}
          <SignedIn>
            <UserButton afterSignOutUrl="/">
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Orders"
                  labelIcon="📦"
                  href="/UserOrderHistory"
                />
                <UserButton.Link
                  label="WishList"
                  labelIcon="📦"
                  href="/wishlist"
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
          {/* Mobile search */}
          <SearchBar />

          {/* Mobile links */}
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm hover:bg-zinc-50",
                    pathname === l.href ? "text-orange-600" : "text-zinc-700"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}

            <li className="pt-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full text-sm font-medium text-orange-500 hover:text-orange-600 transition">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
