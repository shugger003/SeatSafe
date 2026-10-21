import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/auth-forms";
import { Notice } from "@/components/admin/ui";
import { live } from "@/lib/live";

export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  await live();
  const { reset } = await searchParams;
  return (
    <AuthShell title="Sign in">
      {reset ? <div className="mb-6"><Notice>Your password was changed. Sign in with the new one.</Notice></div> : null}
      <LoginForm />
    </AuthShell>
  );
}
