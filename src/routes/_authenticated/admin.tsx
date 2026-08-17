import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { amIAdmin } from "@/lib/admin.functions";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminSettings } from "@/components/admin/AdminSettings";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard | All Tech IT Solution" },
      { name: "description", content: "Manage products, stock, orders and payments." },
      { property: "og:title", content: "Admin dashboard" },
      { property: "og:description", content: "Manage products, stock, orders and payments." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const checkAdmin = useServerFn(amIAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["am-i-admin"], queryFn: () => checkAdmin() });

  if (isLoading) {
    return (
      <SiteShell>
        <div className="container-page py-16 text-sm text-muted-foreground">Checking access…</div>
      </SiteShell>
    );
  }

  if (!data?.isAdmin) {
    return (
      <SiteShell>
        <PageHeader eyebrow="Admin" title="Access restricted" />
        <div className="container-page py-10">
          <p className="text-sm text-muted-foreground">
            This area is only available to store administrators.
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Back to store</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Admin"
        title="Store dashboard"
        subtitle="Products, stock, categories, orders and UPI payment verification."
      />
      <div className="container-page py-8">
        <Tabs defaultValue="overview">
          <TabsList className="flex h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products &amp; stock</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-6">
            <AdminOverview />
          </TabsContent>
          <TabsContent value="products" className="pt-6">
            <AdminProducts />
          </TabsContent>
          <TabsContent value="orders" className="pt-6">
            <AdminOrders />
          </TabsContent>
          <TabsContent value="categories" className="pt-6">
            <AdminCategories />
          </TabsContent>
          <TabsContent value="settings" className="pt-6">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </SiteShell>
  );
}
