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
        className={cn("flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-[16px] border border-line bg-mist px-6 text-center text-pine", className)}
      >
        <ImageSquare size={36} weight="light" aria-hidden="true" />
        <p className="text-sm font-medium">Product image placeholder</p>
        <p className="max-w-xs text-xs leading-5 text-muted">Photography will replace this frame. This is not a picture of the product.</p>
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
