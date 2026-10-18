import { redirect } from "next/navigation";
import { AdminFrame } from "@/components/admin/frame";
import { getSession } from "@/lib/auth";
import { live } from "@/lib/live";

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await live();
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return <AdminFrame email={session.email}>{children}</AdminFrame>;
}
