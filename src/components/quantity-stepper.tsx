"use client";

import { useEffect, useState } from "react";

export function QuantityStepper({
  value,
  max,
  disabled,
  onChange,
}: {
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (quantity: number) => void;
}) {
  const ceiling = Math.max(1, Math.floor(Number.isFinite(max) ? max : 1));
  const digits = String(ceiling).length;
  const [draft, setDraft] = useState(String(value));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [editing, value]);

  function apply(next: number) {
    const quantity = Math.min(ceiling, Math.max(1, next));
    setDraft(String(quantity));
    if (quantity !== value) onChange(quantity);
  }

  function commit() {
    setEditing(false);
    if (!/^\d+$/.test(draft)) {
      setDraft(String(value));
      return;
    }
    apply(Number(draft));
  }

  return (
    <div className="inline-flex items-center border border-line bg-surface focus-within:border-ink">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center text-lg disabled:opacity-40"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => apply(value - 1)}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label="Quantity"
        disabled={disabled}
        value={draft}
        onFocus={(event) => {
          setEditing(true);
          event.currentTarget.select();
        }}
        onChange={(event) => {
          const next = event.target.value.replace(/\D/g, "").slice(0, digits);
          setDraft(next);
          if (/^\d+$/.test(next)) apply(Number(next));
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        style={{ width: `${Math.max(2.5, digits) + 1}ch` }}
        className="h-11 min-w-10 border-0 bg-transparent px-0.5 text-center text-sm tabular-nums text-ink outline-none focus:outline-none disabled:opacity-40"
      />
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center text-lg disabled:opacity-40"
        aria-label="Increase quantity"
        disabled={disabled || value >= ceiling}
        onClick={() => apply(value + 1)}
      >
        +
      </button>
    </div>
  );
}
