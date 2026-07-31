import type { Metadata } from "next";
import Fail from "./Fail";

export const metadata: Metadata = {
  title: "Fail | NEA GENIA TECHNOLOGIES",
  description:
    "Get in touch with the NEA GENIA TECHNOLOGIES team for sales and technical support.",
};

export default function FailPage() {
  return <Fail />;
}
