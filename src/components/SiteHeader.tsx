import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Phone, Search, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";
import { getCategories, getSettings } from "@/lib/catalog.functions";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const { count, hydrated } = useCart();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => getSettings(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const topCategories = (categories ?? []).filter((c) => c.is_active).slice(0, 6);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
      <div className="bg-primary text-primary-foreground">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-1.5 text-xs">
          <span>Refurbished laptops, accessories &amp; IT services in Hadapsar, Pune</span>
          {settings?.phone ? (
            <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-1 font-medium">
              <Phone className="h-3 w-3" /> {settings.phone}
            </a>
          ) : null}
        </div>
      </div>

      <div className="container-page flex items-center gap-3 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
            AT
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-sm font-bold">All Tech IT Solution</span>
            <span className="block text-[11px] text-muted-foreground">Pune · Hadapsar</span>
          </span>
        </Link>

        <form
          className="ml-auto hidden max-w-md flex-1 items-center gap-2 md:flex"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `/shop?search=${encodeURIComponent(term.trim().slice(0, 80))}`;
          }}
        >
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search laptops, SSD, RAM…"
              className="pl-8"
              maxLength={80}
              aria-label="Search products"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button asChild variant="ghost" size="sm">
            <Link to="/account">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {hydrated && count > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
                  {count}
                </span>
              ) : null}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <nav className="hidden border-t border-border md:block">
        <div className="container-page flex items-center gap-5 py-2 text-sm">
          <Link to="/" className="hover:text-accent-foreground/80">
            Home
          </Link>
          <Link to="/shop" className="hover:text-accent-foreground/80">
            Shop
          </Link>
          {topCategories.map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="text-muted-foreground hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
          <Link to="/services" className="text-muted-foreground hover:text-foreground">
            Services
          </Link>
          <Link to="/track" className="ml-auto text-muted-foreground hover:text-foreground">
            Track order
          </Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground">
            Contact
          </Link>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-border bg-card md:hidden">
          <div className="container-page flex flex-col gap-1 py-3 text-sm">
            <form
              className="mb-2"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/shop?search=${encodeURIComponent(term.trim().slice(0, 80))}`;
              }}
            >
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
              />
            </form>
            <Link to="/" onClick={() => setOpen(false)} className="py-1.5">
              Home
            </Link>
            <Link to="/shop" onClick={() => setOpen(false)} className="py-1.5">
              Shop all
            </Link>
            {topCategories.map((c) => (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="py-1.5 text-muted-foreground"
              >
                {c.name}
              </Link>
            ))}
            <Link to="/services" onClick={() => setOpen(false)} className="py-1.5 text-muted-foreground">
              Services
            </Link>
            <Link to="/track" onClick={() => setOpen(false)} className="py-1.5 text-muted-foreground">
              Track order
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="py-1.5 text-muted-foreground">
              Contact
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
