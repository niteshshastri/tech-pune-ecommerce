import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getProductsByIds, getSettings } from "@/lib/catalog.functions";
import { placeOrder } from "@/lib/orders.functions";
import { formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TITLE = "Checkout | All Tech IT Solution Pune";
const DESC = "Complete your order with delivery details and pay securely via UPI.";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const navigate = useNavigate();
  const { lines, clear, hydrated } = useCart();
  const ids = lines.map((l) => l.productId);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "Pune",
    state: "Maharashtra",
    pincode: "",
    notes: "",
  });

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

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!lines.length) return;
    setBusy(true);
    try {
      const result = await placeOrder({
        data: {
          items: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity })),
          ...form,
        },
      });
      clear();
      toast.success("Order placed", { description: `Order ${result.order_number}` });
      navigate({
        to: "/order/$orderNumber",
        params: { orderNumber: result.order_number },
        search: { phone: form.phone },
      });
    } catch (error) {
      toast.error("Could not place order", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  if (hydrated && lines.length === 0) {
    return (
      <SiteShell>
        <PageHeader title="Checkout" />
        <div className="container-page py-16 text-center">
          <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4">
            <Link to="/shop">Browse products</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHeader title="Checkout" eyebrow="Step 2 of 3" subtitle="Delivery details and UPI payment." />
      <form onSubmit={submit} className="container-page grid gap-8 py-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name *</Label>
              <Input
                id="name"
                required
                minLength={2}
                maxLength={120}
                value={form.customer_name}
                onChange={(e) => set("customer_name")(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                required
                inputMode="tel"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                placeholder="10-digit mobile number"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="a1">Address line 1 *</Label>
            <Input
              id="a1"
              required
              minLength={4}
              value={form.address_line1}
              onChange={(e) => set("address_line1")(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="a2">Address line 2</Label>
            <Input id="a2" value={form.address_line2} onChange={(e) => set("address_line2")(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input id="city" required value={form.city} onChange={(e) => set("city")(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={form.state} onChange={(e) => set("state")(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pin">Pincode *</Label>
              <Input
                id="pin"
                required
                inputMode="numeric"
                value={form.pincode}
                onChange={(e) => set("pincode")(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Order notes</Label>
            <Textarea
              id="notes"
              maxLength={500}
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Landmark, preferred delivery time, configuration requests…"
            />
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-5 text-sm">
          <h2 className="font-display font-semibold">Your order</h2>
          <ul className="mt-3 space-y-2">
            {rows.map(({ line, product }) => (
              <li key={line.productId} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {product!.name} × {line.quantity}
                </span>
                <span>{formatINR(product!.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{deliveryFee ? formatINR(deliveryFee) : "Free"}</dd>
            </div>
            <div className="flex justify-between font-display text-base font-bold">
              <dt>Total</dt>
              <dd>{formatINR(subtotal + deliveryFee)}</dd>
            </div>
          </dl>
          <Button type="submit" className="mt-4 w-full" disabled={busy}>
            {busy ? "Placing order…" : "Place order"}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Next step: pay the exact amount by UPI and submit your transaction reference. Our team
            verifies every payment manually.
          </p>
        </aside>
      </form>
    </SiteShell>
  );
}
