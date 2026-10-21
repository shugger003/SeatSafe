"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { loginAction, requestResetAction, resetPasswordAction } from "@/app/actions/admin";
import { Label, Notice, buttonClass, field } from "@/components/admin/ui";

export function LoginForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="grid gap-4"
      action={async (formData) => {
        setPending(true);
        setError("");
        const result = await loginAction(formData);
        setPending(false);
        if (result?.error) setError(result.error);
      }}
    >
      <Label label="Email">
        <input name="email" type="email" required autoComplete="username" className={field} />
      </Label>
      <Label label="Password">
        <PasswordField name="password" autoComplete="current-password" />
      </Label>
      {error ? <Notice tone="warn">{error}</Notice> : null}
      <button disabled={pending} className={buttonClass("primary", "mt-2 w-full")}>{pending ? "Signing in…" : "Sign in"}</button>
      <Link href="/admin/forgot" className="justify-self-center py-2 text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
        Forgot your password?
      </Link>
    </form>
  );
}

export function ForgotForm() {
  const [message, setMessage] = useState<{ tone: "success" | "warn"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <form
      className="grid gap-4"
      action={async (formData) => {
        setPending(true);
        const result = await requestResetAction(formData);
        setPending(false);
        setMessage(result.ok ? { tone: "success", text: "If that email belongs to an admin account, a reset link is on its way. It works for 30 minutes." } : { tone: "warn", text: result.error });
      }}
    >
      <Label label="Admin email">
        <input name="email" type="email" required autoComplete="username" className={field} />
      </Label>
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      <button disabled={pending} className={buttonClass("primary", "mt-2 w-full")}>{pending ? "Sending…" : "Send reset link"}</button>
      <Link href="/admin/login" className="justify-self-center py-2 text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
        Back to sign in
      </Link>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="grid gap-4"
      action={async (formData) => {
        setPending(true);
        setError("");
        const result = await resetPasswordAction(formData);
        setPending(false);
        if (result?.error) setError(result.error);
      }}
    >
      <input type="hidden" name="token" value={token} />
      <Label label="New password" hint="At least 10 characters.">
        <input name="password" type="password" required minLength={10} autoComplete="new-password" className={field} />
      </Label>
      <Label label="Type it again">
        <input name="confirm" type="password" required minLength={10} autoComplete="new-password" className={field} />
      </Label>
      {error ? <Notice tone="warn">{error}</Notice> : null}
      <button disabled={pending} className={buttonClass("primary", "mt-2 w-full")}>{pending ? "Saving…" : "Save new password"}</button>
    </form>
  );
}

function PasswordField({ name, autoComplete }: { name: string; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative block">
      <input
        name={name}
        type={visible ? "text" : "password"}
        required
        autoComplete={autoComplete}
        className={`${field} pr-11`}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-md text-muted hover:text-ink"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
      </button>
    </span>
  );
}
