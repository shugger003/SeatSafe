"use client";

import { useState } from "react";
import { resumePaymentAction } from "@/app/actions/store";

export function ResumePayment({ reference, token }: { reference: string; token: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={pending}
        className="min-h-11 rounded-[10px] bg-pine px-4 text-sm text-paper disabled:opacity-50"
        onClick={async () => {
          setPending(true);
          const result = await resumePaymentAction(reference, token);
          if (!result.ok) {
            setMessage(result.message);
            setPending(false);
            return;
          }
          window.location.href = result.url;
        }}
      >
        {pending ? "Opening payment…" : "Continue to payment"}
      </button>
      {message ? <p className="mt-2 text-sm text-danger">{message}</p> : null}
    </div>
  );
}
