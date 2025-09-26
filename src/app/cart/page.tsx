import type { Metadata } from "next";
import Cart from "./Cart";

export const metadata: Metadata = {
  title: "Cart | SVK ROBOTICS",
  description:
    "Get in touch with the SVK ROBOTICS team for sales and technical support.",
};

export default function CartPage() {
  return <Cart />;
}
