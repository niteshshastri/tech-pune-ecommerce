import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { publicClient } = await import("./catalog.server");
  const { data } = await publicClient().from("business_settings").select("*").limit(1).maybeSingle();
  return data;
});

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { publicClient } = await import("./catalog.server");
  const { data } = await publicClient()
    .from("categories")
    .select("id, name, slug, description, sort_order, is_active, is_archived")
    .order("sort_order");
  return data ?? [];
});

const listSchema = z.object({
  categorySlug: z.string().max(80).optional(),
  search: z.string().max(120).optional(),
  brands: z.array(z.string().max(60)).max(20).optional(),
  minPrice: z.number().min(0).max(10_000_000).optional(),
  maxPrice: z.number().min(0).max(10_000_000).optional(),
  availability: z.enum(["all", "in_stock"]).optional(),
  condition: z.enum(["all", "new", "refurbished", "used"]).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "name_asc"]).optional(),
  featuredOnly: z.boolean().optional(),
  limit: z.number().min(1).max(60).optional(),
});

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => listSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { publicClient, PRODUCT_COLUMNS, normalizeProduct } = await import("./catalog.server");
    let query = publicClient().from("products").select(PRODUCT_COLUMNS);

    if (data.categorySlug) {
      const { data: cat } = await publicClient()
        .from("categories")
        .select("id")
        .eq("slug", data.categorySlug)
        .maybeSingle();
      if (!cat) return [];
      query = query.eq("category_id", cat.id);
    }
    if (data.search) query = query.ilike("name", `%${data.search.replace(/[%_]/g, "")}%`);
    if (data.brands?.length) query = query.in("brand", data.brands);
    if (data.minPrice != null) query = query.gte("price", data.minPrice);
    if (data.maxPrice != null) query = query.lte("price", data.maxPrice);
    if (data.availability === "in_stock") query = query.eq("stock_state", "in_stock");
    if (data.condition && data.condition !== "all") query = query.eq("condition", data.condition);
    if (data.featuredOnly) query = query.eq("is_featured", true);

    switch (data.sort) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "name_asc":
        query = query.order("name", { ascending: true });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data: rows, error } = await query.limit(data.limit ?? 60);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => normalizeProduct(r as Record<string, unknown>));
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { publicClient, PRODUCT_COLUMNS, normalizeProduct } = await import("./catalog.server");
    const { data: row } = await publicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", data.slug)
      .maybeSingle();
    if (!row) return null;
    return normalizeProduct(row as Record<string, unknown>);
  });

export const getProductsByIds = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ ids: z.array(z.string().uuid()).max(50) }).parse(input),
  )
  .handler(async ({ data }) => {
    if (!data.ids.length) return [];
    const { publicClient, PRODUCT_COLUMNS, normalizeProduct } = await import("./catalog.server");
    const { data: rows } = await publicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .in("id", data.ids);
    return (rows ?? []).map((r) => normalizeProduct(r as Record<string, unknown>));
  });

export const getBrands = createServerFn({ method: "GET" }).handler(async () => {
  const { publicClient } = await import("./catalog.server");
  const { data } = await publicClient().from("products").select("brand").not("brand", "is", null);
  const set = new Set((data ?? []).map((r) => r.brand as string).filter(Boolean));
  return [...set].sort();
});
