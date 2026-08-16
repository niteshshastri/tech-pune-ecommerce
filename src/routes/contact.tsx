import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSettings } from "@/lib/catalog.functions";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";

const TITLE = "Contact All Tech IT Solution — Hadapsar, Pune";
const DESC =
  "Call, WhatsApp or visit All Tech IT Solution in Hadapsar, Pune for laptops, accessories and IT support.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });

  return (
    <SiteShell>
      <PageHeader eyebrow="Contact" title="Talk to our team" subtitle="We reply fastest on phone and WhatsApp." />
      <div className="container-page grid gap-6 py-10 md:grid-cols-2">
        <div className="space-y-4 text-sm">
          {settings?.address ? (
            <p className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{settings.address}</span>
            </p>
          ) : null}
          {settings?.phone ? (
            <p className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a className="underline" href={`tel:${settings.phone}`}>
                {settings.phone}
              </a>
            </p>
          ) : null}
          {settings?.whatsapp ? (
            <p className="flex gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a
                className="underline"
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp us
              </a>
            </p>
          ) : null}
          {settings?.email ? (
            <p className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a className="underline" href={`mailto:${settings.email}`}>
                {settings.email}
              </a>
            </p>
          ) : null}
          {settings?.business_hours ? (
            <p className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{settings.business_hours}</span>
            </p>
          ) : null}
          {settings?.google_maps_url ? (
            <Button asChild variant="outline">
              <a href={settings.google_maps_url} target="_blank" rel="noreferrer">
                Open in Google Maps
              </a>
            </Button>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 text-sm">
          <h2 className="font-display font-semibold">Before you visit</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Call ahead to confirm stock for a specific laptop model or configuration.</li>
            <li>Bring your device and charger for repair diagnostics.</li>
            <li>Online orders are paid via UPI and verified manually by our team.</li>
          </ul>
        </div>
      </div>
    </SiteShell>
  );
}
