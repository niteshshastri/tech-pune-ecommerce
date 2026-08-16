import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { getProduct } from "@/lib/catalog.functions";
import { CONDITION_LABELS, STOCK_LABELS, formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { SiteShell } from "@/components/SiteShell";
import { ProductImage } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["product", params.slug],
      queryFn: () => getProduct({ data: { slug: params.slug } }),
    }),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable | All Tech IT Solution" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} | All Tech IT Solution Pune`;
    const description =
      loaderData.short_description ??
      `${loaderData.name} available at All Tech IT Solution, Hadapsar, Pune. ${formatINR(loaderData.price)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProduct({ data: { slug } }),
  });
  const { add } = useCart();
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <SiteShell>
        <div className="container-page py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Product not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This product may have been removed from the catalogue.
          </p>
          <Button asChild className="mt-6">
            <Link to="/shop">Back to shop</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  const images = product.images ?? [];
  const outOfStock = product.stock_state === "out_of_stock";

  return (
    <SiteShell>
      <div className="container-page py-8">
        <nav className="mb-5 text-xs text-muted-foreground">
          <Link to="/shop">Shop</Link>
          {product.category_slug ? (
            <>
              {" / "}
              <Link to="/category/$slug" params={{ slug: product.category_slug }}>
                {product.category_name}
              </Link>
            </>
          ) : null}
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <ProductImage
              url={images[activeImage]?.url ?? product.image_url}
              alt={product.name}
              className="aspect-square w-full rounded-lg border border-border"
            />
            {images.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded border ${i === activeImage ? "border-primary" : "border-border"}`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <ProductImage url={img.url} alt={img.alt_text ?? product.name} className="h-full w-full" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{CONDITION_LABELS[product.condition]}</Badge>
              {product.brand ? <Badge variant="outline">{product.brand}</Badge> : null}
              <Badge variant={product.stock_state === "in_stock" ? "default" : "outline"}>
                {STOCK_LABELS[product.stock_state]}
              </Badge>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold md:text-3xl">{product.name}</h1>
            {product.short_description ? (
              <p className="mt-2 text-sm text-muted-foreground">{product.short_description}</p>
            ) : null}

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold">{formatINR(product.price)}</span>
              {product.compare_at_price && product.compare_at_price > product.price ? (
                <span className="text-sm text-muted-foreground line-through">
                  {formatINR(product.compare_at_price)}
                </span>
              ) : null}
            </div>
            {product.warranty ? (
              <p className="mt-1 text-xs text-muted-foreground">Warranty: {product.warranty}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                disabled={outOfStock}
                onClick={() => {
                  add(product.id, 1);
                  toast.success("Added to cart", { description: product.name });
                }}
              >
                <ShoppingCart className="mr-1 h-4 w-4" />
                {outOfStock ? "Out of stock" : "Add to cart"}
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/cart">Go to cart</Link>
              </Button>
            </div>
            {product.stock_state === "unverified" ? (
              <p className="mt-3 rounded-md bg-secondary p-3 text-xs text-muted-foreground">
                Availability for this item is confirmed by our team before dispatch. You can order now
                and we will call you to confirm.
              </p>
            ) : null}

            {product.specs.length ? (
              <div className="mt-8">
                <h2 className="font-display text-base font-semibold">Specifications</h2>
                <dl className="mt-3 divide-y divide-border rounded-lg border border-border text-sm">
                  {product.specs.map((s, i) => (
                    <div key={i} className="grid grid-cols-3 gap-3 px-3 py-2">
                      <dt className="text-muted-foreground">{s.label}</dt>
                      <dd className="col-span-2">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {product.description ? (
              <div className="mt-8">
                <h2 className="font-display text-base font-semibold">Description</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
