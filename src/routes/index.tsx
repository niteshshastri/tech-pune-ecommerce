import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Cpu, ShieldCheck, Truck, Wrench } from "lucide-react";
import { getCategories, getSettings, listProducts } from "@/lib/catalog.functions";
import { SiteShell } from "@/components/SiteShell";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const TITLE = "Refurbished Laptops & IT Store in Hadapsar, Pune | All Tech IT Solution";
const DESC =
  "Buy refurbished laptops, monitors, SSDs, RAM and computer accessories in Hadapsar, Pune. Sales, service and upgrades from All Tech IT Solution.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => getCategories() });
  const { data: featured } = useQuery({
    queryKey: ["products", "home"],
    queryFn: () => listProducts({ data: { sort: "newest", limit: 8 } }),
  });

  return (
    <SiteShell>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="container-page grid gap-8 py-14 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
              Hadapsar · Pune · Since day one
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight md:text-5xl">
              Reliable refurbished laptops &amp; IT gear, priced for Pune businesses
            </h1>
            <p className="mt-4 max-w-xl text-primary-foreground/80">
              {settings?.tagline ??
                "Laptops, monitors, SSDs, RAM and accessories — tested, warranty-backed and delivered across Pune. Plus on-site service and upgrades."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/shop">
                  Shop all products <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/services">IT services</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { icon: Cpu, title: "Tested hardware", body: "Every refurbished unit checked before dispatch." },
              { icon: ShieldCheck, title: "Warranty backed", body: "Clear warranty terms on eligible products." },
              { icon: Truck, title: "Pune delivery", body: "Local delivery and store pickup in Hadapsar." },
              { icon: Wrench, title: "Service & upgrades", body: "Repairs, SSD/RAM upgrades and AMC support." },
            ].map((f) => (
              <div key={f.title} className="rounded-lg bg-primary-foreground/10 p-4">
                <f.icon className="h-5 w-5" />
                <h2 className="mt-2 font-display text-sm font-semibold">{f.title}</h2>
                <p className="mt-1 text-xs text-primary-foreground/70">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <h2 className="font-display text-2xl font-bold">Shop by category</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(categories ?? [])
            .filter((c) => c.is_active)
            .map((c) => (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
              >
                <span className="font-display text-sm font-semibold">{c.name}</span>
                {c.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
                ) : null}
              </Link>
            ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/50 py-12">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold">Latest in store</h2>
            <Link to="/shop" className="text-sm font-medium text-primary underline">
              View all
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {(featured ?? []).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-6 py-12 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="font-display text-2xl font-bold">Your neighbourhood IT shop in Hadapsar</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {settings?.about_text ??
              "All Tech IT Solution supplies refurbished laptops, desktops, monitors and computer accessories to homes, students, startups and offices across Hadapsar, Magarpatta, Amanora, Kharadi and wider Pune. We also handle repairs, upgrades, data recovery and annual maintenance contracts."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/contact">Contact us</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/track">Track an order</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 text-sm">
          <h3 className="font-display font-semibold">Store details</h3>
          <dl className="mt-3 space-y-2 text-muted-foreground">
            {settings?.address ? <dd>{settings.address}</dd> : null}
            {settings?.phone ? (
              <dd>
                <a className="underline" href={`tel:${settings.phone}`}>
                  {settings.phone}
                </a>
              </dd>
            ) : null}
            {settings?.email ? <dd>{settings.email}</dd> : null}
            {settings?.business_hours ? <dd>{settings.business_hours}</dd> : null}
          </dl>
        </div>
      </section>
    </SiteShell>
  );
}
