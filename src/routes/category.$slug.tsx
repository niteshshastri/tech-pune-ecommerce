import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCategories, listProducts } from "@/lib/catalog.functions";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const pretty = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const title = `${pretty} in Pune | All Tech IT Solution`;
    const description = `Buy ${pretty.toLowerCase()} in Hadapsar, Pune. Tested hardware, clear warranty terms and local delivery from All Tech IT Solution.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => getCategories() });
  const category = (categories ?? []).find((c) => c.slug === slug);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "category", slug],
    queryFn: () => listProducts({ data: { categorySlug: slug, limit: 60 } }),
  });

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Category"
        title={category?.name ?? slug.replace(/-/g, " ")}
        subtitle={category?.description ?? undefined}
      />
      <div className="container-page py-8">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading products…</p>
        ) : products?.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No products listed in this category yet.
          </p>
        )}
      </div>
    </SiteShell>
  );
}
