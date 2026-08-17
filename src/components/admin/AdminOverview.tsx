import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminStats } from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";

export function AdminOverview() {
  const fetchStats = useServerFn(adminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchStats() });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading overview…</p>;

  const cards = [
    { label: "Products", value: String(data?.products ?? 0) },
    { label: "Stock needs verification", value: String(data?.unverifiedStock ?? 0) },
    { label: "Orders", value: String(data?.orders ?? 0) },
    { label: "Payments to verify", value: String(data?.pendingVerification ?? 0) },
    { label: "Confirmed revenue", value: formatINR(data?.revenue ?? 0) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
          <p className="mt-1 font-display text-2xl font-bold">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
