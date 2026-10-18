"use client";

import { useState } from "react";

export function CopyLink({ path }: { path: string }) {
  const [label, setLabel] = useState("Copy link");

  return (
    <button
      type="button"
      className="min-h-11 text-sm underline underline-offset-4"
      onClick={async () => {
        const url = new URL(path, window.location.origin).toString();
        try {
          await navigator.clipboard.writeText(url);
          setLabel("Link copied");
        } catch {
          setLabel("Copy the address from the browser bar");
        }
      }}
    >
      {label}
    </button>
  );
}
