import type { Metadata } from "next";
import OrderHistory from "./OrderHistory";

export const metadata: Metadata = {
  title: "Order History | SVK ROBOTICS",
  description:
    "Get in touch with the SVK ROBOTICS team for sales and technical support.",
};

export default function OrderHistoryPage() {
  return <OrderHistory />;
}
