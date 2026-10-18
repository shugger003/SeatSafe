import { cn } from "@/lib/cn";

export function ProductMedia({
  src,
  alt,
  priority = false,
  className,
}: {
  src?: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt || "Product image placeholder"}
        className={cn(
          "relative flex aspect-[4/3] max-h-[28rem] items-center justify-center overflow-hidden bg-stone px-8 text-center text-ink",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-5 border border-ink/10" aria-hidden="true" />
        <div className="relative max-w-[16rem]">
          <p className="font-display text-3xl leading-none tracking-[-0.03em]">Photograph not published</p>
          <p className="mt-3 text-sm leading-6 text-muted">This frame is not a picture of the product.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden bg-stone", className)}>
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
