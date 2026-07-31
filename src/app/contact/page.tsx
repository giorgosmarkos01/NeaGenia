import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | NEA GENIA TECHNOLOGIES",
  description:
    "Get in touch with the NEA GENIA TECHNOLOGIES team for sales and technical support.",
};

export default function ContactPage() {
  return <ContactForm />;
}
