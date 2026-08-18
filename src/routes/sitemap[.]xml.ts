import { createFileRoute } from "@tanstack/react-router";

const STATIC_PATHS = [
  "/",
  "/shop",
  "/services",
  "/about",
  "/contact",
  "/track",
  "/policies/privacy",
  "/policies/terms",
  "/policies/delivery",
  "/policies/refund",
  "/policies/cancellation",
  "/policies/warranty",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const { publicClient } = await import("@/lib/catalog.server");
        const supabase = publicClient();

        const [products, categories] = await Promise.all([
          supabase.from("products").select("slug, updated_at").eq("is_active", true).limit(1000),
          supabase.from("categories").select("slug").eq("is_active", true).limit(200),
        ]);

        const urls: { loc: string; lastmod?: string }[] = [
          ...STATIC_PATHS.map((p) => ({ loc: `${origin}${p}` })),
          ...(categories.data ?? []).map((c) => ({ loc: `${origin}/category/${c.slug}` })),
          ...(products.data ?? []).map((p) => ({
            loc: `${origin}/product/${p.slug}`,
            lastmod: p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : undefined,
          })),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
