import Link from "next/link";
import { resetTokenValid } from "@/lib/admin-credentials";
import { AuthShell } from "@/components/admin/auth-shell";
import { ResetForm } from "@/components/admin/auth-forms";
import { Notice } from "@/components/admin/ui";
import { live } from "@/lib/live";

export const instant = false;

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  await live();
  const { token = "" } = await searchParams;
  if (!(await resetTokenValid(token))) {
    return (
      <AuthShell title="Link expired">
        <Notice tone="warn">This reset link has expired or was already used.</Notice>
        <Link href="/admin/forgot" className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-pine underline-offset-4 hover:underline">
          Ask for a new link
        </Link>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Choose a new password" description="You’ll be signed out everywhere and can sign in with the new password.">
      <ResetForm token={token} />
    </AuthShell>
  );
}
