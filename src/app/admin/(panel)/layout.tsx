import { redirect } from "next/navigation";
import { AdminFrame } from "@/components/admin/frame";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { live } from "@/lib/live";
import { safeHref } from "@/lib/safe";

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await live();
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const store = await getStore();
  return (
    <AdminFrame email={session.email} businessName={store.businessName} logoUrl={safeHref(store.logoUrl) || ""}>
      {children}
    </AdminFrame>
  );
}
