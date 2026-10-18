"use client";

import { useState } from "react";
import { contactAction } from "@/app/actions/store";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4"
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
        setMessage(result.ok ? (result.emailed ? "Message sent." : "Message saved. Email delivery is not configured, so check inquiries in the dashboard.") : result.message);
        if (result.ok) event.currentTarget.reset();
      }}
    >
      <label className="grid gap-1 text-sm">Name<input name="name" required className="min-h-11 rounded-[10px] border border-line bg-surface px-3" /></label>
      <label className="grid gap-1 text-sm">Email<input name="email" type="email" required className="min-h-11 rounded-[10px] border border-line bg-surface px-3" /></label>
      <label className="grid gap-1 text-sm">Phone<input name="phone" className="min-h-11 rounded-[10px] border border-line bg-surface px-3" /></label>
      <label className="grid gap-1 text-sm">Message<textarea name="message" required minLength={10} className="min-h-32 rounded-[10px] border border-line bg-surface px-3 py-2" /></label>
      <label className="hidden">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      <button disabled={pending} className="min-h-11 rounded-[10px] bg-pine px-4 text-paper disabled:opacity-50">{pending ? "Sending…" : "Send message"}</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
