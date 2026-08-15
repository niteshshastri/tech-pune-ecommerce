export function formatINR(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  payment_pending: "Payment Pending",
  verification_pending: "Payment Verification Pending",
  paid: "Paid",
  processing: "Processing",
  ready_for_delivery: "Ready for Delivery",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  payment_pending: "Payment Pending",
  verification_pending: "Verification Pending",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

export const STOCK_LABELS: Record<string, string> = {
  unverified: "Availability on request",
  in_stock: "In stock",
  out_of_stock: "Out of stock",
};

export const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  refurbished: "Refurbished",
  used: "Used",
};
