import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/catalog.functions";

export function SiteFooter() {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => getSettings(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <footer className="mt-16 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div>
          <h3 className="font-display text-base font-bold">
            {settings?.business_name ?? "All Tech IT Solution"}
          </h3>
          <p className="mt-2 text-sm text-primary-foreground/75">
            {settings?.tagline ??
              "Refurbished laptops, computer accessories, monitors and IT services in Pune."}
          </p>
          {settings?.gst_number ? (
            <p className="mt-3 text-xs text-primary-foreground/60">GST: {settings.gst_number}</p>
          ) : null}
        </div>

        <div className="text-sm">
          <h4 className="font-display text-sm font-semibold">Shop</h4>
          <ul className="mt-3 space-y-2 text-primary-foreground/75">
            <li>
              <Link to="/shop">All products</Link>
            </li>
            <li>
              <Link to="/category/$slug" params={{ slug: "refurbished-laptops" }}>
                Refurbished laptops
              </Link>
            </li>
            <li>
              <Link to="/category/$slug" params={{ slug: "monitors" }}>
                Monitors
              </Link>
            </li>
            <li>
              <Link to="/category/$slug" params={{ slug: "accessories" }}>
                Accessories
              </Link>
            </li>
            <li>
              <Link to="/services">IT services</Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h4 className="font-display text-sm font-semibold">Help</h4>
          <ul className="mt-3 space-y-2 text-primary-foreground/75">
            <li>
              <Link to="/track">Track your order</Link>
            </li>
            <li>
              <Link to="/about">About us</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/policies/warranty">Warranty policy</Link>
            </li>
            <li>
              <Link to="/policies/delivery">Delivery policy</Link>
            </li>
            <li>
              <Link to="/policies/refund">Refund &amp; cancellation</Link>
            </li>
            <li>
              <Link to="/policies/privacy">Privacy policy</Link>
            </li>
            <li>
              <Link to="/policies/terms">Terms of service</Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h4 className="font-display text-sm font-semibold">Visit us</h4>
          <ul className="mt-3 space-y-3 text-primary-foreground/75">
            {settings?.address ? (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{settings.address}</span>
              </li>
            ) : null}
            {settings?.phone ? (
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`tel:${settings.phone}`}>{settings.phone}</a>
              </li>
            ) : null}
            {settings?.email ? (
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            ) : null}
            {settings?.business_hours ? (
              <li className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{settings.business_hours}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-primary-foreground/60">
          <span>
            © {new Date().getFullYear()} {settings?.business_name ?? "All Tech IT Solution"}. All
            rights reserved.
          </span>
          <span>Payments via UPI · Manual verification by our team</span>
        </div>
      </div>
    </footer>
  );
}
