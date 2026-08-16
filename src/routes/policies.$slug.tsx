import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/catalog.functions";
import { PageHeader, ProseSection, SiteShell } from "@/components/SiteShell";
import type { BusinessSettings } from "@/lib/types";

type PolicyKey = "privacy" | "terms" | "delivery" | "refund" | "cancellation" | "warranty";

const POLICIES: Record<
  PolicyKey,
  { title: string; field: keyof BusinessSettings; fallback: string }
> = {
  privacy: {
    title: "Privacy policy",
    field: "privacy_policy",
    fallback:
      "We collect only the details needed to process and deliver your order: name, phone number, email and delivery address. We do not sell or rent your data. Payment references you submit are used only to verify your UPI payment.",
  },
  terms: {
    title: "Terms of service",
    field: "terms",
    fallback:
      "Prices, specifications and availability are subject to change without notice. Orders are confirmed after our team verifies your UPI payment and stock availability. Refurbished products are sold in the condition described on the product page.",
  },
  delivery: {
    title: "Delivery policy",
    field: "delivery_policy",
    fallback:
      "We deliver across Pune and offer store pickup in Hadapsar. Dispatch usually happens within 1–3 working days of verified payment. Delivery timelines for outstation orders are shared on confirmation.",
  },
  refund: {
    title: "Refund policy",
    field: "refund_policy",
    fallback:
      "If a product arrives damaged or does not match its description, contact us within 48 hours of delivery. Approved refunds are returned to the original UPI account after the product is inspected.",
  },
  cancellation: {
    title: "Cancellation policy",
    field: "cancellation_policy",
    fallback:
      "Orders can be cancelled free of charge any time before dispatch. Once dispatched, cancellation is treated as a return and is subject to inspection.",
  },
  warranty: {
    title: "Warranty policy",
    field: "warranty_policy",
    fallback:
      "Warranty periods are listed on each product page. Warranty covers hardware faults under normal use and excludes physical damage, liquid damage and unauthorised repairs.",
  },
};

export const Route = createFileRoute("/policies/$slug")({
  head: ({ params }) => {
    const policy = POLICIES[params.slug as PolicyKey];
    const title = `${policy?.title ?? "Policies"} | All Tech IT Solution Pune`;
    const description = `${policy?.title ?? "Store policies"} for All Tech IT Solution, Hadapsar, Pune.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PolicyPage,
});

function PolicyPage() {
  const { slug } = Route.useParams();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });
  const policy = POLICIES[slug as PolicyKey];

  if (!policy) {
    return (
      <SiteShell>
        <PageHeader title="Policy not found" />
        <div className="container-page py-10 text-sm text-muted-foreground">
          This policy page does not exist.
        </div>
      </SiteShell>
    );
  }

  const value = settings ? (settings as unknown as Record<string, string | null>)[policy.field] : null;

  return (
    <SiteShell>
      <PageHeader eyebrow="Policies" title={policy.title} />
      <ProseSection text={value} fallback={policy.fallback} />
    </SiteShell>
  );
}
