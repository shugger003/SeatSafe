"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/admin";

export default function LoginPage() {
  const [error, setError] = useState("");
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-pine px-12 py-16 text-paper lg:flex lg:flex-col lg:justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-paper/60">Store admin</p>
        <div>
          <h1 className="max-w-md font-display text-6xl leading-[1.02]">The catalog, orders, and copy live here.</h1>
          <p className="mt-5 max-w-sm text-paper/75">Sign in with the administrator account configured on the server. There is no public registration.</p>
        </div>
        <p className="text-sm text-paper/55">Placeholder brand. Published details still come from the business.</p>
      </section>
      <section className="flex items-center px-5 py-16 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.16em] text-clay lg:hidden">Store admin</p>
          <h2 className="font-display text-4xl">Sign in</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Use the administrator email and password. Visitors cannot create an account from this page.</p>
          <form
            className="mt-8 grid gap-4"
            action={async (formData) => {
              const result = await loginAction(formData);
              if (result?.error) setError(result.error);
            }}
          >
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Email</span>
              <input name="email" type="email" required autoComplete="username" className="min-h-12 rounded-[12px] border border-line bg-surface px-3" />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Password</span>
              <input name="password" type="password" required autoComplete="current-password" className="min-h-12 rounded-[12px] border border-line bg-surface px-3" />
            </label>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <button className="mt-2 min-h-12 rounded-full bg-pine text-paper hover:bg-pine-dark">Sign in</button>
          </form>
        </div>
      </section>
    </main>
  );
}
