import type { Metadata } from "next";
import Fail from "./Fail";

export const metadata: Metadata = {
  title: "Fail | SVK ROBOTICS",
  description:
    "Get in touch with the SVK ROBOTICS team for sales and technical support.",
};

export default function FailPage() {
  return <Fail />;
}
