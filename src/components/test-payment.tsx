"use client";

import { useState } from "react";
import { simulateTestPaymentAction } from "@/app/actions/store";

export function TestPayment({ reference }: { reference: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function choose(outcome: "success" | "failed" | "abandoned") {
    setPending(true);
    const result = await simulateTestPaymentAction(reference, outcome);
    if (!result.ok) {
      setMessage(result.message);
      setPending(false);
      return;
    }
    window.location.href = `/order/${result.token}`;
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <p className="text-xs uppercase tracking-[0.16em] text-clay">Test gateway</p>
      <h1 className="mt-2 font-display text-4xl">No money is collected</h1>
      <p className="mt-3 text-muted">This screen exists only when PAYMENTS_MODE=test and the app is not in production. It is not a Moolre payment.</p>
      {message ? <p className="mt-4 text-sm text-danger">{message}</p> : null}
      <div className="mt-6 grid gap-3">
        <button type="button" disabled={pending} onClick={() => choose("success")} className="min-h-11 rounded-[10px] bg-pine text-paper disabled:opacity-50">Simulate successful test payment</button>
        <button type="button" disabled={pending} onClick={() => choose("failed")} className="min-h-11 rounded-[10px] border border-line disabled:opacity-50">Simulate failed payment</button>
        <button type="button" disabled={pending} onClick={() => choose("abandoned")} className="min-h-11 rounded-[10px] border border-line disabled:opacity-50">Simulate cancelled payment</button>
      </div>
    </div>
  );
}
