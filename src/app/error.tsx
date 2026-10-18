"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-3 text-muted">The page could not be loaded. Please try again.</p>
      <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-[10px] bg-pine px-4 text-paper">
        Try again
      </button>
    </div>
  );
}
