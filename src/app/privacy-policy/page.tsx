import type { Metadata } from "next";
import Privacy from "./Privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | SVK ROBOTICS",
  description:
    "Read the privacy policy of SVK ROBOTICS regarding GDPR and data handling.",
};

export default function PrivacyPage() {
  return <Privacy />;
}
