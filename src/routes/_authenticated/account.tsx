import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listMyOrders } from "@/lib/orders.functions";
import { amIAdmin } from "@/lib/admin.functions";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, formatDate, formatINR } from "@/lib/format";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account | All Tech IT Solution" },
      { name: "description", content: "Your orders and account details." },
      { property: "og:title", content: "My account" },
      { property: "og:description", content: "Your orders and account details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

function Account() {
  const navigate = useNavigate();
  const fetchOrders = useServerFn(listMyOrders);
  const fetchAdmin = useServerFn(amIAdmin);

  const { data: orders, isLoading } = useQuery({ queryKey: ["my-orders"], queryFn: () => fetchOrders() });
  const { data: role } = useQuery({ queryKey: ["am-i-admin"], queryFn: () => fetchAdmin() });

  return (
    <SiteShell>
      <PageHeader eyebrow="Account" title="My orders" />
      <div className="container-page py-8">
        <div className="mb-6 flex flex-wrap gap-3">
          {role?.isAdmin ? (
            <Button asChild>
              <Link to="/admin">Open admin dashboard</Link>
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
          >
            Sign out
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading orders…</p>
        ) : orders?.length ? (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="rounded-lg border border-border p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display font-semibold">{order.order_number}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>{ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}</Badge>
                  <Badge variant="outline">
                    {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                  </Badge>
                </div>
                <ul className="mt-3 space-y-1 text-muted-foreground">
                  {(order.order_items ?? []).map((item) => (
                    <li key={item.id}>
                      {item.product_name} × {item.quantity} — {formatINR(item.line_total)}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-semibold">Total {formatINR(order.total)}</p>
                <Link
                  to="/order/$orderNumber"
                  params={{ orderNumber: order.order_number }}
                  search={{}}
                  className="mt-2 inline-block text-xs text-primary underline"
                >
                  View order &amp; payment
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            You have no orders yet.
          </p>
        )}
      </div>
    </SiteShell>
  );
}
