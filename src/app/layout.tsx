import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/providers/ReduxProvider";
import CartLoader from "@/components/client/CartLoader";
import { ClerkProvider } from "@clerk/nextjs";
import CookieConsent from "@/components/client/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEA GENIA TECHNOLOGIES ESHOP",
  description:
    "The best place to buy awesome products for robotics enthusiasts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ReduxProvider>
            <CartLoader />
            {children}
            <CookieConsent />
          </ReduxProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
