import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adminAddProductImage,
  adminDeleteProduct,
  adminDeleteProductImage,
  adminListProducts,
  adminSaveProduct,
  adminSetPrimaryImage,
  adminSetStock,
} from "@/lib/admin.functions";
import { getCategories } from "@/lib/catalog.functions";
import { STOCK_LABELS, formatINR } from "@/lib/format";
import type { Spec } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StockState = "unverified" | "in_stock" | "out_of_stock";
type Condition = "new" | "refurbished" | "used";

type ProductRow = Awaited<ReturnType<typeof adminListProducts>>[number];

type Draft = {
  id?: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  brand: string;
  condition: Condition;
  category_id: string | null;
  price: number;
  compare_at_price: number | null;
  warranty: string;
  specsText: string;
  stock_quantity: number;
  stock_state: StockState;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
};

const EMPTY: Draft = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  brand: "",
  condition: "refurbished",
  category_id: null,
  price: 0,
  compare_at_price: null,
  warranty: "",
  specsText: "",
  stock_quantity: 0,
  stock_state: "unverified",
  is_featured: false,
  is_bestseller: false,
  is_active: true,
};

function parseSpecs(text: string): Spec[] {
  return text
    .split("\n")
    .map((line) => line.split(":"))
    .filter((parts) => parts.length >= 2 && parts[0]?.trim())
    .slice(0, 30)
    .map((parts) => ({
      label: (parts[0] ?? "").trim().slice(0, 60),
      value: parts.slice(1).join(":").trim().slice(0, 300),
    }));
}

function specsToText(specs: unknown): string {
  if (!Array.isArray(specs)) return "";
  return specs
    .map((s) => {
      const spec = s as Partial<Spec>;
      return spec?.label ? `${spec.label}: ${spec.value ?? ""}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

export function AdminProducts() {
  const queryClient = useQueryClient();
  const listProductsFn = useServerFn(adminListProducts);
  const saveProduct = useServerFn(adminSaveProduct);
  const setStock = useServerFn(adminSetStock);
  const deleteProduct = useServerFn(adminDeleteProduct);
  const addImage = useServerFn(adminAddProductImage);
  const deleteImage = useServerFn(adminDeleteProductImage);
  const setPrimary = useServerFn(adminSetPrimaryImage);

  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listProductsFn(),
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => getCategories() });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = products ?? [];
    if (!term) return rows;
    return rows.filter((p) =>
      `${p.name} ${p.brand ?? ""} ${p.slug}`.toLowerCase().includes(term),
    );
  }, [products, search]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const saveMutation = useMutation({
    mutationFn: (input: Draft) =>
      saveProduct({
        data: {
          ...(input.id ? { id: input.id } : {}),
          name: input.name,
          slug: input.slug,
          short_description: input.short_description,
          description: input.description,
          brand: input.brand,
          condition: input.condition,
          category_id: input.category_id,
          price: input.price,
          compare_at_price: input.compare_at_price,
          warranty: input.warranty,
          specs: parseSpecs(input.specsText),
          stock_quantity: input.stock_quantity,
          stock_state: input.stock_state,
          is_featured: input.is_featured,
          is_bestseller: input.is_bestseller,
          is_active: input.is_active,
        },
      }),
    onSuccess: async () => {
      toast.success("Product saved");
      setDraft(null);
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const stockMutation = useMutation({
    mutationFn: (input: { id: string; stock_quantity: number; stock_state: StockState }) =>
      setStock({ data: input }),
    onSuccess: async () => {
      toast.success("Stock updated");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: async () => {
      toast.success("Product hidden from store");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function handleUpload(productId: string, file: File) {
    setUploadingFor(productId);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${productId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw new Error(error.message);
      await addImage({ data: { product_id: productId, storage_path: path, alt_text: "" } });
      toast.success("Image uploaded");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingFor(null);
    }
  }

  function editRow(p: ProductRow) {
    setDraft({
      id: p.id,
      name: p.name,
      slug: p.slug,
      short_description: p.short_description ?? "",
      description: p.description ?? "",
      brand: p.brand ?? "",
      condition: p.condition as Condition,
      category_id: p.category_id ?? null,
      price: Number(p.price),
      compare_at_price: p.compare_at_price === null ? null : Number(p.compare_at_price),
      warranty: p.warranty ?? "",
      specsText: specsToText(p.specs),
      stock_quantity: p.stock_quantity,
      stock_state: p.stock_state as StockState,
      is_featured: p.is_featured,
      is_bestseller: p.is_bestseller,
      is_active: p.is_active,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="max-w-xs"
        />
        <Button onClick={() => setDraft({ ...EMPTY })}>Add product</Button>
      </div>

      {draft ? (
        <form
          className="grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(draft);
          }}
        >
          <h3 className="font-display text-sm font-bold md:col-span-2">
            {draft.id ? "Edit product" : "New product"}
          </h3>
          <div className="md:col-span-2">
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              required
              minLength={3}
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="p-brand">Brand</Label>
            <Input
              id="p-brand"
              value={draft.brand}
              onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
              maxLength={60}
            />
          </div>
          <div>
            <Label htmlFor="p-slug">Slug (optional)</Label>
            <Input
              id="p-slug"
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              maxLength={120}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select
              value={draft.category_id ?? "none"}
              onValueChange={(v) => setDraft({ ...draft, category_id: v === "none" ? null : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {(categories ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Condition</Label>
            <Select
              value={draft.condition}
              onValueChange={(v) => setDraft({ ...draft, condition: v as Condition })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="refurbished">Refurbished</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="p-price">Price (₹)</Label>
            <Input
              id="p-price"
              type="number"
              min={0}
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="p-compare">Compare-at price (₹, optional)</Label>
            <Input
              id="p-compare"
              type="number"
              min={0}
              value={draft.compare_at_price ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  compare_at_price: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="p-stockqty">Stock quantity</Label>
            <Input
              id="p-stockqty"
              type="number"
              min={0}
              value={draft.stock_quantity}
              onChange={(e) => setDraft({ ...draft, stock_quantity: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Stock status</Label>
            <Select
              value={draft.stock_state}
              onValueChange={(v) => setDraft({ ...draft, stock_state: v as StockState })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unverified">Needs verification</SelectItem>
                <SelectItem value="in_stock">In stock</SelectItem>
                <SelectItem value="out_of_stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="p-short">Short description</Label>
            <Input
              id="p-short"
              value={draft.short_description}
              onChange={(e) => setDraft({ ...draft, short_description: e.target.value })}
              maxLength={300}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="p-desc">Full description</Label>
            <Textarea
              id="p-desc"
              rows={4}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              maxLength={5000}
            />
          </div>
          <div>
            <Label htmlFor="p-warranty">Warranty</Label>
            <Input
              id="p-warranty"
              value={draft.warranty}
              onChange={(e) => setDraft({ ...draft, warranty: e.target.value })}
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="p-specs">Specs (one per line, "Label: value")</Label>
            <Textarea
              id="p-specs"
              rows={4}
              value={draft.specsText}
              onChange={(e) => setDraft({ ...draft, specsText: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-6 md:col-span-2">
            <div className="flex items-center gap-2">
              <Switch
                id="p-active"
                checked={draft.is_active}
                onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
              />
              <Label htmlFor="p-active">Visible in store</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="p-featured"
                checked={draft.is_featured}
                onCheckedChange={(v) => setDraft({ ...draft, is_featured: v })}
              />
              <Label htmlFor="p-featured">Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="p-best"
                checked={draft.is_bestseller}
                onCheckedChange={(v) => setDraft({ ...draft, is_bestseller: v })}
              />
              <Label htmlFor="p-best">Bestseller</Label>
            </div>
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={saveMutation.isPending}>
              Save product
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading products…</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const images = p.product_images ?? [];
            return (
              <div key={p.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-[200px]">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.brand ?? "—"} · {formatINR(p.price)} ·{" "}
                      {STOCK_LABELS[p.stock_state as StockState]} ({p.stock_quantity})
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {!p.is_active ? <Badge variant="outline">Hidden</Badge> : null}
                      {p.is_featured ? <Badge variant="secondary">Featured</Badge> : null}
                      {p.is_bestseller ? <Badge variant="secondary">Bestseller</Badge> : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      defaultValue={p.stock_quantity}
                      className="w-20"
                      aria-label={`Stock quantity for ${p.name}`}
                      onBlur={(e) =>
                        stockMutation.mutate({
                          id: p.id,
                          stock_quantity: Number(e.target.value),
                          stock_state: p.stock_state as StockState,
                        })
                      }
                    />
                    <Select
                      value={p.stock_state}
                      onValueChange={(v) =>
                        stockMutation.mutate({
                          id: p.id,
                          stock_quantity: p.stock_quantity,
                          stock_state: v as StockState,
                        })
                      }
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unverified">Needs verification</SelectItem>
                        <SelectItem value="in_stock">In stock</SelectItem>
                        <SelectItem value="out_of_stock">Out of stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => editRow(p)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => archiveMutation.mutate(p.id)}
                      disabled={!p.is_active}
                    >
                      Hide
                    </Button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {images.map((img) => (
                    <div key={img.id} className="w-24">
                      <img
                        src={img.url}
                        alt={img.alt_text ?? p.name}
                        className="h-20 w-24 rounded border border-border object-contain"
                      />
                      <div className="mt-1 flex gap-1">
                        <button
                          type="button"
                          className="text-[11px] text-muted-foreground underline"
                          onClick={async () => {
                            await setPrimary({ data: { id: img.id, product_id: p.id } });
                            await refresh();
                          }}
                        >
                          {img.is_primary ? "Primary" : "Make primary"}
                        </button>
                        <button
                          type="button"
                          className="text-[11px] text-destructive underline"
                          onClick={async () => {
                            await deleteImage({ data: { id: img.id } });
                            await refresh();
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  <label className="text-xs text-muted-foreground">
                    <span className="mb-1 block">
                      {uploadingFor === p.id ? "Uploading…" : "Upload photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-52 text-xs"
                      disabled={uploadingFor === p.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) void handleUpload(p.id, file);
                      }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
