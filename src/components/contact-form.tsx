"use client";

import { useState } from "react";
import { contactAction } from "@/app/actions/store";
import { Notice } from "@/components/ui";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid content-start gap-5 border border-line bg-surface p-6 sm:p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        const result = await contactAction({
          name: String(form.get("name") || ""),
          email: String(form.get("email") || ""),
          phone: String(form.get("phone") || ""),
          message: String(form.get("message") || ""),
          company: String(form.get("company") || ""),
        });
        setPending(false);
        setOk(result.ok);
        setMessage(result.ok ? (result.emailed ? "Message sent. The store can reply from the address you gave." : "Message saved. Email delivery is not configured, so the store will see it in the dashboard.") : result.message);
        if (result.ok) event.currentTarget.reset();
      }}
    >
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Name</span>
        <input name="name" required autoComplete="name" className="field" />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Email</span>
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Phone, optional</span>
        <input name="phone" type="tel" autoComplete="tel" className="field" />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Message</span>
        <textarea name="message" required minLength={10} className="field min-h-32" />
      </label>
      <label className="hidden">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <button disabled={pending} className="min-h-11 bg-ink px-6 text-paper transition-colors hover:bg-pine disabled:opacity-50">
        {pending ? "Sending\u2026" : "Send message"}
      </button>
      {message ? <Notice tone={ok ? "plain" : "warn"}>{message}</Notice> : null}
    </form>
  );
}
