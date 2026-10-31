import type { Metadata } from "next";
import { PartnershipScreen } from "@/components/partnership-screen";
import { PARTNERSHIPS } from "@/lib/partnerships";

const page = PARTNERSHIPS.bulk;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: page.href },
};

export default function BulkPage() {
  return <PartnershipScreen id="bulk" />;
}
