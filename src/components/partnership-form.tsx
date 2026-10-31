"use client";

import { useState } from "react";
import { partnershipAction } from "@/app/actions/partnership";
import { PARTNERSHIPS, SELLING_OPTIONS, type PartnershipId } from "@/lib/partnerships";

const field = "min-h-11 w-full rounded-[10px] border border-line bg-paper px-3";

export function PartnershipForm({ kind }: { kind: PartnershipId }) {
  const page = PARTNERSHIPS[kind];
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setPending(true);
        const result = await partnershipAction({
          kind,
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          phone: String(data.get("phone") || ""),
          organisation: String(data.get("organisation") || ""),
          quantity: String(data.get("quantity") || ""),
          place: String(data.get("place") || ""),
          channel: String(data.get("channel") || ""),
          selling: String(data.get("selling") || ""),
          note: String(data.get("note") || ""),
          company: String(data.get("company") || ""),
        });
        setPending(false);
        setSent(result.ok);
        setMessage(result.ok ? "Request sent. We will reply by phone or email." : result.message);
        if (result.ok) form.reset();
      }}
    >
      <Field label="Name">
        <input name="name" required autoComplete="name" className={field} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className={field} />
      </Field>
      <Field label="Phone">
        <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" className={field} />
      </Field>
      {kind === "bulk" ? (
        <>
          <Field label="Organisation" hint="Optional. A hotel, office, school, clinic, or shop.">
            <input name="organisation" autoComplete="organization" className={field} />
          </Field>
          <Field label="How many bottles" hint="From 2 to 10,000.">
            <input name="quantity" type="number" required min={2} max={10000} inputMode="numeric" className={field} />
          </Field>
          <Field label="Where should we deliver">
            <input name="place" required autoComplete="address-level1" className={field} />
          </Field>
        </>
      ) : null}
      {kind === "affiliate" ? (
        <Field label="Where you would share it" hint="For example Instagram, WhatsApp, a website, or a shop.">
          <input name="channel" required className={field} />
        </Field>
      ) : null}
      {kind === "distributor" ? (
        <>
          <Field label="Business name">
            <input name="organisation" required autoComplete="organization" className={field} />
          </Field>
          <Field label="Region you cover">
            <input name="place" required autoComplete="address-level1" className={field} />
          </Field>
          <Field label="How you would sell">
            <select name="selling" required defaultValue="" className={field}>
              <option value="" disabled>
                Choose one
              </option>
              {SELLING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
        </>
      ) : null}
      <Field label="Anything else" hint="Optional.">
        <textarea name="note" maxLength={1000} className={`${field} min-h-28 py-2`} />
      </Field>
      <label className="hidden">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <button disabled={pending} className="min-h-11 rounded-[10px] bg-pine px-4 text-paper disabled:opacity-50">
        {pending ? "Sending\u2026" : page.submit}
      </button>
      {message ? (
        <p className={sent ? "text-sm" : "text-sm text-danger"} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
