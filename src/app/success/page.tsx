import type { Metadata } from "next";
import Success from "./Success";

export const metadata: Metadata = {
  title: "Success | SVK ROBOTICS",
  description:
    "Get in touch with the SVK ROBOTICS team for sales and technical support.",
};

export default function SuccessPage() {
  return <Success />;
}
