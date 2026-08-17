import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminListOrders, adminUpdateOrder } from "@/lib/admin.functions";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, formatDate, formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrderStatus =
  | "payment_pending"
  | "verification_pending"
  | "paid"
  | "processing"
  | "ready_for_delivery"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

type PaymentStatus = "payment_pending" | "verification_pending" | "paid" | "refunded" | "failed";

const ORDER_STATUSES: OrderStatus[] = [
  "payment_pending",
  "verification_pending",
  "paid",
  "processing",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "payment_pending",
  "verification_pending",
  "paid",
  "refunded",
  "failed",
];

export function AdminOrders() {
  const queryClient = useQueryClient();
  const listOrders = useServerFn(adminListOrders);
  const updateOrder = useServerFn(adminUpdateOrder);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => listOrders(),
  });

  const mutation = useMutation({
    mutationFn: (input: {
      id: string;
      order_status?: OrderStatus;
      payment_status?: PaymentStatus;
      admin_notes?: string;
    }) => updateOrder({ data: input }),
    onSuccess: async () => {
      toast.success("Order updated");
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading orders…</p>;
  if (!orders?.length)
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No orders yet.
      </p>
    );

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="rounded-lg border border-border bg-card p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display font-bold">{o.order_number}</p>
              <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
              <p className="mt-1">
                {o.customer_name} · {o.phone}
                {o.email ? ` · ${o.email}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {o.address_line1}
                {o.address_line2 ? `, ${o.address_line2}` : ""}, {o.city}, {o.state} {o.pincode}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-bold">{formatINR(o.total)}</p>
              <p className="text-xs text-muted-foreground">
                Items {formatINR(o.subtotal)} + delivery {formatINR(o.delivery_fee)}
              </p>
              <div className="mt-1 flex flex-wrap justify-end gap-1">
                <Badge variant="secondary">{ORDER_STATUS_LABELS[o.order_status]}</Badge>
                <Badge variant={o.payment_status === "paid" ? "default" : "outline"}>
                  {PAYMENT_STATUS_LABELS[o.payment_status]}
                </Badge>
              </div>
            </div>
          </div>

          <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
            {(o.order_items ?? []).map((item) => (
              <li key={item.id}>
                {item.quantity} × {item.product_name} — {formatINR(item.line_total)}
              </li>
            ))}
          </ul>

          <div className="mt-3 rounded-md bg-secondary p-3 text-xs">
            <p>
              <span className="font-semibold">UPI transaction ID:</span>{" "}
              {o.upi_reference ?? "Not submitted yet"}
            </p>
            {o.notes ? (
              <p className="mt-1">
                <span className="font-semibold">Customer note:</span> {o.notes}
              </p>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground">Order status</label>
              <Select
                value={o.order_status}
                onValueChange={(v) => mutation.mutate({ id: o.id, order_status: v as OrderStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {ORDER_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Payment status</label>
              <Select
                value={o.payment_status}
                onValueChange={(v) =>
                  mutation.mutate({ id: o.id, payment_status: v as PaymentStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {PAYMENT_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs text-muted-foreground">Internal notes</label>
            <Textarea
              rows={2}
              value={notes[o.id] ?? o.admin_notes ?? ""}
              onChange={(e) => setNotes({ ...notes, [o.id]: e.target.value })}
              maxLength={1000}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  mutation.mutate({ id: o.id, admin_notes: notes[o.id] ?? o.admin_notes ?? "" })
                }
              >
                Save notes
              </Button>
              {o.payment_status !== "paid" ? (
                <Button
                  size="sm"
                  onClick={() =>
                    mutation.mutate({
                      id: o.id,
                      payment_status: "paid",
                      order_status: "processing",
                    })
                  }
                >
                  Verify payment &amp; process
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
