import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { getBrands, getCategories, listProducts } from "@/lib/catalog.functions";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const TITLE = "Shop Laptops, Monitors & Accessories in Pune | All Tech IT Solution";
const DESC =
  "Browse our full catalogue of refurbished laptops, monitors, SSDs, RAM, keyboards and computer accessories with Pune delivery.";

const searchSchema = z.object({
  search: z.string().max(80).optional(),
  category: z.string().max(80).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Shop,
});

function Shop() {
  const initial = Route.useSearch();
  const [term, setTerm] = useState(initial.search ?? "");
  const [category, setCategory] = useState(initial.category ?? "");
  const [brands, setBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc" | "name_asc">("newest");

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => getCategories() });
  const { data: brandList } = useQuery({ queryKey: ["brands"], queryFn: () => getBrands() });

  const filters = {
    search: term.trim() || undefined,
    categorySlug: category || undefined,
    brands: brands.length ? brands : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    availability: inStockOnly ? ("in_stock" as const) : ("all" as const),
    sort,
    limit: 60,
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => listProducts({ data: filters }),
  });

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Catalogue"
        title="Shop all products"
        subtitle="Refurbished laptops, monitors, storage, memory and accessories — sold and serviced in Hadapsar, Pune."
      />
      <div className="container-page grid gap-8 py-8 md:grid-cols-[240px_1fr]">
        <aside className="space-y-6 text-sm">
          <div>
            <Label htmlFor="q">Search</Label>
            <Input
              id="q"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. ThinkPad, SSD"
              maxLength={80}
              className="mt-1"
            />
          </div>

          <div>
            <p className="font-semibold">Category</p>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => setCategory("")}
                className={`block text-left ${category === "" ? "font-semibold text-primary" : "text-muted-foreground"}`}
              >
                All categories
              </button>
              {(categories ?? [])
                .filter((c) => c.is_active)
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.slug)}
                    className={`block text-left ${category === c.slug ? "font-semibold text-primary" : "text-muted-foreground"}`}
                  >
                    {c.name}
                  </button>
                ))}
            </div>
          </div>

          {brandList?.length ? (
            <div>
              <p className="font-semibold">Brand</p>
              <div className="mt-2 space-y-2">
                {brandList.map((b) => (
                  <label key={b} className="flex items-center gap-2 text-muted-foreground">
                    <Checkbox
                      checked={brands.includes(b)}
                      onCheckedChange={(v) =>
                        setBrands((prev) => (v ? [...prev, b] : prev.filter((x) => x !== b)))
                      }
                    />
                    {b}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="font-semibold">Price (₹)</p>
            <div className="mt-2 flex gap-2">
              <Input
                inputMode="numeric"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
                placeholder="Min"
              />
              <Input
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
                placeholder="Max"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-muted-foreground">
            <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(Boolean(v))} />
            Confirmed in stock only
          </label>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setTerm("");
              setCategory("");
              setBrands([]);
              setMinPrice("");
              setMaxPrice("");
              setInStockOnly(false);
              setSort("newest");
            }}
          >
            Clear filters
          </Button>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">
              {isLoading ? "Loading…" : `${products?.length ?? 0} products`}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="h-9 rounded-md border border-input bg-background px-2"
              aria-label="Sort products"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="name_asc">Name A–Z</option>
            </select>
          </div>

          {products?.length === 0 && !isLoading ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No products match these filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {(products ?? []).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
