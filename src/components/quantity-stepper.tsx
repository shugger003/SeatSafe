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
  const ceiling = Math.max(1, Math.min(20, max || 1));
  return (
    <div className="inline-flex items-center border border-line bg-surface">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center text-lg disabled:opacity-40"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center text-lg disabled:opacity-40"
        aria-label="Increase quantity"
        disabled={disabled || value >= ceiling}
        onClick={() => onChange(Math.min(ceiling, value + 1))}
      >
        +
      </button>
    </div>
  );
}
