import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | SVK ROBOTICS",
  description:
    "Get in touch with the SVK ROBOTICS team for sales and technical support.",
};

export default function ContactPage() {
  return <ContactForm />;
}
