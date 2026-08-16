import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { getSettings } from "@/lib/catalog.functions";
import { getOrderByNumber, submitPaymentReference } from "@/lib/orders.functions";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, formatDate, formatINR } from "@/lib/format";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/order/$orderNumber")({
  validateSearch: (search: Record<string, unknown>) =>
    z.object({ phone: z.string().max(20).optional() }).parse(search),
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.orderNumber} | All Tech IT Solution` },
      { name: "description", content: "Your order details and UPI payment instructions." },
      { property: "og:title", content: `Order ${params.orderNumber}` },
      { property: "og:description", content: "Order details and UPI payment instructions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { orderNumber } = Route.useParams();
  const { phone: phoneFromSearch } = Route.useSearch();
  const [phone, setPhone] = useState(phoneFromSearch ?? "");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });
  const {
    data: order,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["order", orderNumber, phone],
    queryFn: () => getOrderByNumber({ data: { order_number: orderNumber, phone } }),
    enabled: Boolean(phone),
  });

  const upiLink =
    settings?.upi_id && order
      ? `upi://pay?pa=${encodeURIComponent(settings.upi_id)}&pn=${encodeURIComponent(
          settings.upi_payee_name ?? settings.business_name,
        )}&am=${order.total}&cu=INR&tn=${encodeURIComponent(order.order_number)}`
      : null;

  async function submitReference(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submitPaymentReference({
        data: { order_number: orderNumber, phone, reference },
      });
      setReference("");
      await refetch();
      toast.success("Reference submitted", {
        description: "Our team will verify your payment shortly.",
      });
    } catch (error) {
      toast.error("Could not submit reference", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <PageHeader eyebrow="Order" title={`Order ${orderNumber}`} />
      <div className="container-page py-8">
        {!phone ? (
          <form
            className="max-w-sm space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              refetch();
            }}
          >
            <Label htmlFor="p">Enter the phone number used on this order</Label>
            <Input id="p" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
            <Button type="submit">View order</Button>
          </form>
        ) : isFetching && !order ? (
          <p className="text-sm text-muted-foreground">Loading order…</p>
        ) : !order ? (
          <div>
            <p className="text-sm text-muted-foreground">
              We couldn't find that order with this phone number.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setPhone("")}>
              Try another number
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge>{ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}</Badge>
                <Badge variant="outline">
                  Payment: {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                </Badge>
                <span className="text-xs text-muted-foreground">Placed {formatDate(order.created_at)}</span>
              </div>

              <div className="rounded-lg border border-border">
                <ul className="divide-y divide-border text-sm">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3 p-3">
                      <span>
                        {item.product_name} × {item.quantity}
                      </span>
                      <span>{formatINR(item.line_total)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="space-y-1 border-t border-border p-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd>{formatINR(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd>{Number(order.delivery_fee) ? formatINR(order.delivery_fee) : "Free"}</dd>
                  </div>
                  <div className="flex justify-between font-display text-base font-bold">
                    <dt>Total</dt>
                    <dd>{formatINR(order.total)}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border border-border p-4 text-sm">
                <h2 className="font-display font-semibold">Delivery address</h2>
                <p className="mt-2 text-muted-foreground">
                  {order.customer_name}
                  <br />
                  {order.address_line1}
                  {order.address_line2 ? (
                    <>
                      <br />
                      {order.address_line2}
                    </>
                  ) : null}
                  <br />
                  {order.city}, {order.state} {order.pincode}
                  <br />
                  {order.phone}
                </p>
              </div>
            </div>

            <aside className="h-fit rounded-lg border border-border bg-card p-5 text-sm">
              <h2 className="font-display font-semibold">Pay by UPI</h2>
              <p className="mt-2 text-muted-foreground">
                Pay exactly <strong className="text-foreground">{formatINR(order.total)}</strong> and enter
                your UPI transaction reference below.
              </p>

              {settings?.upi_id ? (
                <p className="mt-3 rounded-md bg-secondary p-3 font-mono text-xs">{settings.upi_id}</p>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  UPI ID not configured yet — please call us to complete payment.
                </p>
              )}
              {settings?.upi_qr_url ? (
                <img
                  src={settings.upi_qr_url}
                  alt="UPI QR code"
                  className="mt-3 w-40 rounded border border-border"
                  loading="lazy"
                />
              ) : null}
              {upiLink ? (
                <Button asChild variant="outline" className="mt-3 w-full">
                  <a href={upiLink}>Open UPI app</a>
                </Button>
              ) : null}

              {order.payment_status === "paid" ? (
                <p className="mt-4 rounded-md bg-secondary p-3 text-xs">
                  Payment verified. Thank you!
                </p>
              ) : (
                <form onSubmit={submitReference} className="mt-4 space-y-2">
                  <Label htmlFor="ref">UPI transaction reference</Label>
                  <Input
                    id="ref"
                    required
                    minLength={4}
                    maxLength={80}
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. 4351XXXXXXXX"
                  />
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Submitting…" : "Submit reference"}
                  </Button>
                  {order.upi_reference ? (
                    <p className="text-xs text-muted-foreground">
                      Submitted: {order.upi_reference} — awaiting verification by our team.
                    </p>
                  ) : null}
                </form>
              )}

              <Button asChild variant="ghost" className="mt-4 w-full">
                <Link to="/shop">Continue shopping</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
