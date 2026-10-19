import { cn } from "@/lib/cn";

export function ProductMedia({
  src,
  alt,
  priority = false,
  tone = "stone",
  className,
}: {
  src?: string | null;
  alt: string;
  priority?: boolean;
  tone?: "stone" | "stage";
  className?: string;
}) {
  const stage = tone === "stage";
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt || "Product image placeholder"}
        className={cn(
          "relative flex items-center justify-center overflow-hidden px-8 text-center",
          stage
            ? "aspect-[4/3] w-full max-w-full rounded-lg bg-pine text-paper lg:aspect-[4/5]"
            : "aspect-[4/3] max-h-[28rem] rounded-lg bg-mist text-ink",
          className,
        )}
      >
        <div
          className={cn("pointer-events-none absolute inset-5 rounded-md border", stage ? "border-paper/25" : "border-ink/10")}
          aria-hidden="true"
        />
        <div className="relative max-w-[16rem]">
          <p className={cn("font-display leading-none tracking-[-0.03em]", stage ? "text-4xl sm:text-5xl" : "text-3xl")}>Photograph not published</p>
          <p className={cn("mt-4 text-sm leading-6", stage ? "text-paper/75" : "text-muted")}>This frame is not a picture of the product.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg bg-mist", className)}>
      {/* Uploaded media is served by the app and is not part of the static image pipeline. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="aspect-[4/3] max-h-[28rem] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </div>
  );
}
