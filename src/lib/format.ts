/** Indian digit grouping (1,23,456) without Intl so server and browser output match exactly. */
function groupIndian(value: number): string {
  const rounded = Math.round(Math.abs(value)).toString();
  if (rounded.length <= 3) return rounded;
  const last3 = rounded.slice(-3);
  const rest = rounded.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${last3}`;
}

export function formatINR(value: number | string | null | undefined): string {
  const raw = typeof value === "string" ? Number(value) : (value ?? 0);
  const n = Number.isFinite(raw) ? raw : 0;
  return `${n < 0 ? "-" : ""}₹${groupIndian(n)}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats a timestamp in IST (Asia/Kolkata) deterministically. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(ist.getUTCDate())} ${MONTHS[ist.getUTCMonth()]} ${ist.getUTCFullYear()}, ${pad(
    ist.getUTCHours(),
  )}:${pad(ist.getUTCMinutes())}`;
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
