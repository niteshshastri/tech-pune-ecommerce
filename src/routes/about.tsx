import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/catalog.functions";
import { PageHeader, ProseSection, SiteShell } from "@/components/SiteShell";

const TITLE = "About All Tech IT Solution | Computer Shop in Hadapsar, Pune";
const DESC =
  "All Tech IT Solution is a computer and laptop shop in Hadapsar, Pune supplying refurbished laptops, accessories and IT services.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: About,
});

function About() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });

  return (
    <SiteShell>
      <PageHeader eyebrow="About us" title={settings?.business_name ?? "All Tech IT Solution"} />
      <ProseSection
        text={settings?.about_text}
        fallback={`All Tech IT Solution is a computer and laptop shop based in Hadapsar, Pune. We supply refurbished laptops, monitors, storage, memory and computer accessories to students, homes, startups and offices across Pune.

Every refurbished machine is tested before it leaves our store, and we back eligible products with clear warranty terms. Alongside sales, we handle repairs, upgrades, data recovery, networking and annual maintenance contracts.

Visit the store for hands-on help, or order online and we will confirm availability with a call before dispatch.`}
      />
    </SiteShell>
  );
}
