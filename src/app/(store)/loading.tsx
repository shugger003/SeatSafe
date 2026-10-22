export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8" aria-busy="true" aria-live="polite">
      <div className="h-10 w-48 rounded-md bg-stone/80" />
      <div className="mt-6 h-4 max-w-md rounded-md bg-stone/60" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="aspect-[4/3] rounded-lg bg-stone/70" />
        <div className="space-y-3">
          <div className="h-4 rounded-md bg-stone/60" />
          <div className="h-4 w-5/6 rounded-md bg-stone/50" />
          <div className="h-4 w-2/3 rounded-md bg-stone/40" />
        </div>
      </div>
    </div>
  );
}
