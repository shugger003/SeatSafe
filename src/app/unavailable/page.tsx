import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "ASAS SitSafe",
  robots: { index: false, follow: false },
};

export default function UnavailablePage() {
  redirect("/");
}
