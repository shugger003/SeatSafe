"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/admin";

export default function LoginPage() {
  const [error, setError] = useState("");
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <h1 className="font-display text-4xl">Administrator sign in</h1>
      <p className="mt-3 text-sm text-muted">There is no public registration. Access uses the administrator email and password configured on the server.</p>
      <form
        className="mt-6 grid gap-3"
        action={async (formData) => {
          const result = await loginAction(formData);
          if (result?.error) setError(result.error);
        }}
      >
        <label className="grid gap-1 text-sm">Email<input name="email" type="email" required autoComplete="username" className="min-h-11 rounded-[10px] border border-line px-3" /></label>
        <label className="grid gap-1 text-sm">Password<input name="password" type="password" required autoComplete="current-password" className="min-h-11 rounded-[10px] border border-line px-3" /></label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button className="min-h-11 rounded-[10px] bg-pine text-paper">Sign in</button>
      </form>
    </main>
  );
}
