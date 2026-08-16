import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";
import type { PublicProduct } from "@/lib/types";
import { CONDITION_LABELS, STOCK_LABELS, formatINR } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function ProductImage({
  url,
  alt,
  className,
}: {
  url: string | null | undefined;
  alt: string;
  className?: string;
}) {
  if (!url) {
    return (
      <div
        className={`grid place-items-center bg-secondary text-center text-muted-foreground ${className ?? ""}`}
      >
        <div className="p-4">
          <ImageOff className="mx-auto h-6 w-6" />
          <p className="mt-1 text-[11px] leading-tight">Photo needed — upload from admin</p>
        </div>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`bg-secondary object-contain ${className ?? ""}`}
    />
  );
}

export function ProductCard({ product }: { product: PublicProduct }) {
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
    >
      <ProductImage
        url={product.image_url}
        alt={product.name}
        className="aspect-4/3 w-full transition-transform group-hover:scale-[1.02]"
      />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[10px]">
            {CONDITION_LABELS[product.condition]}
          </Badge>
          {product.brand ? (
            <Badge variant="outline" className="text-[10px]">
              {product.brand}
            </Badge>
          ) : null}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{product.name}</h3>
        {product.short_description ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">{product.short_description}</p>
        ) : null}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-base font-bold">{formatINR(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatINR(product.compare_at_price)}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {STOCK_LABELS[product.stock_state]}
          </p>
        </div>
      </div>
    </Link>
  );
}
