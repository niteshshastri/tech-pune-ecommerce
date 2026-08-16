import { createFileRoute, Link } from "@tanstack/react-router";
import { HardDrive, Laptop, Network, ShieldCheck, Wrench, Database } from "lucide-react";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";

const TITLE = "Laptop Repair & IT Services in Hadapsar, Pune | All Tech IT Solution";
const DESC =
  "Laptop and desktop repair, SSD and RAM upgrades, data recovery, networking and annual maintenance contracts in Hadapsar, Pune.";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Services,
});

const SERVICES = [
  { icon: Laptop, title: "Laptop & desktop repair", body: "Diagnostics, screen, keyboard, battery, motherboard-level repair." },
  { icon: HardDrive, title: "SSD & RAM upgrades", body: "Make an older machine feel new with tested upgrade parts." },
  { icon: Database, title: "Data recovery & backup", body: "Recovery from failing drives and secure backup setup." },
  { icon: Network, title: "Networking & CCTV", body: "Wi-Fi, LAN cabling and camera installation for offices." },
  { icon: ShieldCheck, title: "OS & antivirus setup", body: "Clean OS installs, drivers, licensed software and security." },
  { icon: Wrench, title: "AMC for businesses", body: "Annual maintenance contracts for offices and institutes in Pune." },
];

function Services() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Services"
        title="IT services for homes and businesses in Pune"
        subtitle="Walk in to our Hadapsar store or ask for on-site support across Pune."
      />
      <div className="container-page grid gap-4 py-10 md:grid-cols-3">
        {SERVICES.map((s) => (
          <div key={s.title} className="rounded-lg border border-border bg-card p-5">
            <s.icon className="h-5 w-5 text-primary" />
            <h2 className="mt-2 font-display text-base font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="container-page pb-12">
        <Button asChild>
          <Link to="/contact">Request a service call</Link>
        </Button>
      </div>
    </SiteShell>
  );
}
