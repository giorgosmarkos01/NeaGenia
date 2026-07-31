import type { Metadata } from "next";
import OrderHistory from "./OrderHistory";

export const metadata: Metadata = {
  title: "Order History | NEA GENIA TECHNOLOGIES",
  description:
    "Get in touch with the NEA GENIA TECHNOLOGIES team for sales and technical support.",
};

export default function OrderHistoryPage() {
  return <OrderHistory />;
}
