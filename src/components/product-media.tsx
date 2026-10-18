import { ImageSquare } from "@phosphor-icons/react/dist/ssr/ImageSquare";
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
        className={cn("relative flex aspect-[4/5] flex-col items-center justify-center overflow-hidden rounded-[22px] bg-pine px-8 text-center text-paper shadow-soft", className)}
      >
        <div className="pointer-events-none absolute inset-5 rounded-[16px] border border-paper/20" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-paper/10" aria-hidden="true" />
        <ImageSquare size={36} weight="light" aria-hidden="true" />
        <p className="mt-4 text-sm font-medium tracking-wide">Photography comes later</p>
        <p className="mt-2 max-w-[16rem] text-xs leading-5 text-paper/75">This frame is a placeholder. It is not a picture of the product.</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-[16px] border border-line bg-mist", className)}>
      {/* Uploaded media is served by the app and is not part of the static image pipeline. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="aspect-[4/5] w-full object-cover"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </div>
  );
}
