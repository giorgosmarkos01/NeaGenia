"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Package, Tag, Layers, Handshake, ReceiptText, ArrowLeft, Menu, X } from "lucide-react";

function cn(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

const NAV_ITEMS = [
  { href: "/admin", label: "Products", icon: Package, match: (p: string) => p === "/admin" || p.startsWith("/admin/products") },
  { href: "/admin/categories", label: "Categories", icon: Tag, match: (p: string) => p.startsWith("/admin/categories") },
  { href: "/admin/groups", label: "Groups", icon: Layers, match: (p: string) => p.startsWith("/admin/groups") },
  { href: "/admin/collaborators", label: "Collaborators", icon: Handshake, match: (p: string) => p.startsWith("/admin/collaborators") },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText, match: (p: string) => p.startsWith("/admin/orders") },
];

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link href="/admin" className="text-lg font-bold">
          SVK Admin
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              match(pathname) ? "bg-black text-white" : "text-zinc-700 hover:bg-zinc-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </Link>
        <div className="mt-3 flex items-center gap-3 px-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm text-zinc-500">Account</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block md:w-60 md:shrink-0 md:border-r md:bg-white">
        <div className="sticky top-0 h-screen">
          <SidebarContent pathname={pathname} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
        <Link href="/admin" className="font-bold">
          SVK Admin
        </Link>
        <button
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <SidebarContent pathname={pathname} />
          </div>
        </div>
      )}
    </>
  );
}
