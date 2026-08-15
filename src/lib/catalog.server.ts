import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { PublicProduct, Spec } from "./types";

export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const PRODUCT_COLUMNS =
  "id, name, slug, short_description, description, brand, condition, category_id, price, compare_at_price, warranty, specs, stock_quantity, stock_state, is_featured, is_bestseller, categories(name, slug), product_images(id, url, alt_text, sort_order, is_primary)";

type RawProduct = Record<string, unknown>;

export function normalizeProduct(row: RawProduct): PublicProduct {
  const category = (row["categories"] ?? null) as { name: string; slug: string } | null;
  const rawImages = (row["product_images"] ?? []) as {
    id: string;
    url: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
  }[];
  const images = [...rawImages].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
  );
  const specs = Array.isArray(row["specs"]) ? (row["specs"] as Spec[]) : [];

  return {
    id: String(row["id"]),
    name: String(row["name"]),
    slug: String(row["slug"]),
    short_description: (row["short_description"] as string | null) ?? null,
    description: (row["description"] as string | null) ?? null,
    brand: (row["brand"] as string | null) ?? null,
    condition: row["condition"] as PublicProduct["condition"],
    category_id: (row["category_id"] as string | null) ?? null,
    category_name: category?.name ?? null,
    category_slug: category?.slug ?? null,
    price: Number(row["price"]),
    compare_at_price: row["compare_at_price"] == null ? null : Number(row["compare_at_price"]),
    warranty: (row["warranty"] as string | null) ?? null,
    specs: specs.filter((s) => s && typeof s.value === "string"),
    stock_quantity: Number(row["stock_quantity"] ?? 0),
    stock_state: row["stock_state"] as PublicProduct["stock_state"],
    is_featured: Boolean(row["is_featured"]),
    is_bestseller: Boolean(row["is_bestseller"]),
    image_url: images[0]?.url ?? null,
    images: images.map((i) => ({ id: i.id, url: i.url, alt_text: i.alt_text })),
  };
}
