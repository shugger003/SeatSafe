import Link from "next/link";
import { AuthShell } from "@/components/admin/auth-shell";
import { ForgotForm } from "@/components/admin/auth-forms";
import { Notice } from "@/components/admin/ui";
import { emailConfigured } from "@/lib/email";
import { live } from "@/lib/live";

export const instant = false;

export default async function ForgotPage() {
  await live();
  if (!emailConfigured()) {
    return (
      <AuthShell title="Forgot your password?">
        <Notice tone="warn">Reset emails are not set up for this store yet, so a link can’t be sent. The password can still be changed in the hosting settings on Vercel.</Notice>
        <Link href="/admin/login" className="mt-6 inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
          Back to sign in
        </Link>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Forgot your password?" description="Enter the admin email and we’ll send a link to choose a new password.">
      <ForgotForm />
    </AuthShell>
  );
}
