import type { Metadata } from "next";
import { PartnershipScreen } from "@/components/partnership-screen";
import { PARTNERSHIPS } from "@/lib/partnerships";

const page = PARTNERSHIPS.distributor;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: page.href },
};

export default function DistributorPage() {
  return <PartnershipScreen id="distributor" />;
}
