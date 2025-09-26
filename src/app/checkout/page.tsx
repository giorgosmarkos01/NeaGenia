import type { Metadata } from "next";
import CheckOut from "./CheckOut";

export const metadata: Metadata = {
  title: "Checkout | SVK ROBOTICS",
  description: "Complete your purchase with the SVK ROBOTICS team.",
};

export default function CheckOutPage() {
  return <CheckOut />;
}
