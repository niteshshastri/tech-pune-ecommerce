import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { getProductsByIds, getSettings } from "@/lib/catalog.functions";
import { formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { ProductImage } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TITLE = "Your Cart | All Tech IT Solution Pune";
const DESC = "Review the laptops and accessories in your cart before checkout.";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQuantity, remove, hydrated } = useCart();
  const ids = lines.map((l) => l.productId);

  const { data: products } = useQuery({
    queryKey: ["cart-products", ids],
    queryFn: () => getProductsByIds({ data: { ids } }),
    enabled: hydrated && ids.length > 0,
  });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });

  const rows = lines
    .map((l) => ({ line: l, product: (products ?? []).find((p) => p.id === l.productId) }))
    .filter((r) => r.product);

  const subtotal = rows.reduce((sum, r) => sum + r.product!.price * r.line.quantity, 0);
  const deliveryFee = Number(settings?.delivery_fee ?? 0);

  return (
    <SiteShell>
      <PageHeader title="Your cart" eyebrow="Checkout" />
      <div className="container-page grid gap-8 py-8 md:grid-cols-[1fr_320px]">
        <div>
          {!hydrated ? (
            <p className="text-sm text-muted-foreground">Loading cart…</p>
          ) : rows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              <Button asChild className="mt-4">
                <Link to="/shop">Browse products</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {rows.map(({ line, product }) => (
                <li key={line.productId} className="flex gap-3 p-3">
                  <ProductImage
                    url={product!.image_url}
                    alt={product!.name}
                    className="h-20 w-20 shrink-0 rounded border border-border"
                  />
                  <div className="flex-1">
                    <Link
                      to="/product/$slug"
                      params={{ slug: product!.slug }}
                      className="text-sm font-semibold hover:underline"
                    >
                      {product!.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{formatINR(product!.price)} each</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={line.quantity}
                        onChange={(e) => setQuantity(line.productId, Number(e.target.value))}
                        className="h-8 w-20"
                        aria-label={`Quantity for ${product!.name}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(line.productId)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right text-sm font-semibold">
                    {formatINR(product!.price * line.quantity)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-5 text-sm">
          <h2 className="font-display font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{deliveryFee ? formatINR(deliveryFee) : "Free"}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-display text-base font-bold">
              <dt>Total</dt>
              <dd>{formatINR(subtotal + deliveryFee)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Final amount is recalculated from current prices when you place the order.
          </p>
          <Button asChild className="mt-4 w-full" disabled={rows.length === 0}>
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
        </aside>
      </div>
    </SiteShell>
  );
}
