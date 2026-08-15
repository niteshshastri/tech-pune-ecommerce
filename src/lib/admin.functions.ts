import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const specSchema = z.array(z.object({ label: z.string().max(60), value: z.string().max(300) })).max(30);

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(3).max(200),
  slug: z.string().trim().max(120).optional().or(z.literal("")),
  short_description: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  brand: z.string().trim().max(60).optional().or(z.literal("")),
  condition: z.enum(["new", "refurbished", "used"]),
  category_id: z.string().uuid().nullable().optional(),
  price: z.number().min(0).max(10_000_000),
  compare_at_price: z.number().min(0).max(10_000_000).nullable().optional(),
  warranty: z.string().trim().max(200).optional().or(z.literal("")),
  specs: specSchema.optional(),
  stock_quantity: z.number().int().min(0).max(100000),
  stock_state: z.enum(["unverified", "in_stock", "out_of_stock"]),
  is_featured: z.boolean(),
  is_bestseller: z.boolean(),
  is_active: z.boolean(),
});

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data), userId: context.userId };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [products, unverified, orders, pending, revenue] = await Promise.all([
      supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("stock_state", "unverified"),
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "verification_pending"),
      supabaseAdmin.from("orders").select("total").eq("payment_status", "paid"),
    ]);

    return {
      products: products.count ?? 0,
      unverifiedStock: unverified.count ?? 0,
      orders: orders.count ?? 0,
      pendingVerification: pending.count ?? 0,
      revenue: (revenue.data ?? []).reduce((sum, r) => sum + Number(r.total), 0),
    };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, name, slug, brand, condition, price, compare_at_price, stock_quantity, stock_state, is_active, is_featured, is_bestseller, category_id, short_description, description, warranty, specs, categories(name), product_images(id, url, storage_path, alt_text, sort_order, is_primary)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, slugify } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const payload = {
      name: data.name,
      slug: data.slug ? slugify(data.slug) : `${slugify(data.name)}-${Date.now().toString(36)}`,
      short_description: data.short_description || null,
      description: data.description || null,
      brand: data.brand || null,
      condition: data.condition,
      category_id: data.category_id ?? null,
      price: data.price,
      compare_at_price: data.compare_at_price ?? null,
      warranty: data.warranty || null,
      specs: data.specs ?? [],
      stock_quantity: data.stock_quantity,
      stock_state: data.stock_state,
      is_featured: data.is_featured,
      is_bestseller: data.is_bestseller,
      is_active: data.is_active,
    };

    if (data.id) {
      const { slug, ...rest } = payload;
      const update = data.slug ? { ...rest, slug } : rest;
      const { error } = await supabaseAdmin.from("products").update(update).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("products")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const adminSetStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        stock_quantity: z.number().int().min(0).max(100000),
        stock_state: z.enum(["unverified", "in_stock", "out_of_stock"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("products")
      .update({ stock_quantity: data.stock_quantity, stock_state: data.stock_state })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: false })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSaveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().trim().min(2).max(120),
        description: z.string().trim().max(500).optional().or(z.literal("")),
        sort_order: z.number().int().min(0).max(999),
        is_active: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, slugify } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("categories")
        .update({
          name: data.name,
          description: data.description || null,
          sort_order: data.sort_order,
          is_active: data.is_active,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("categories")
      .insert({
        name: data.name,
        slug: slugify(data.name),
        description: data.description || null,
        sort_order: data.sort_order,
        is_active: data.is_active,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const adminAddProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        product_id: z.string().uuid(),
        storage_path: z.string().min(3).max(300),
        alt_text: z.string().trim().max(200).optional().or(z.literal("")),
        is_primary: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count } = await supabaseAdmin
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", data.product_id);

    const isPrimary = data.is_primary ?? (count ?? 0) === 0;
    if (isPrimary) {
      await supabaseAdmin
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", data.product_id);
    }

    const { error } = await supabaseAdmin.from("product_images").insert({
      product_id: data.product_id,
      storage_path: data.storage_path,
      url: `/api/public/product-image/${data.storage_path}`,
      alt_text: data.alt_text || null,
      sort_order: count ?? 0,
      is_primary: isPrimary,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: image } = await supabaseAdmin
      .from("product_images")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (image?.storage_path) {
      await supabaseAdmin.storage.from("product-images").remove([image.storage_path]);
    }
    await supabaseAdmin.from("product_images").delete().eq("id", data.id);
    return { ok: true };
  });

export const adminSetPrimaryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), product_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", data.product_id);
    await supabaseAdmin.from("product_images").update({ is_primary: true }).eq("id", data.id);
    return { ok: true };
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, customer_name, phone, email, address_line1, address_line2, city, state, pincode, notes, subtotal, delivery_fee, total, payment_status, order_status, upi_reference, admin_notes, created_at, order_items(id, product_name, product_slug, unit_price, quantity, line_total)",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpdateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        order_status: z
          .enum([
            "payment_pending",
            "verification_pending",
            "paid",
            "processing",
            "ready_for_delivery",
            "out_for_delivery",
            "delivered",
            "cancelled",
            "refunded",
          ])
          .optional(),
        payment_status: z
          .enum(["payment_pending", "verification_pending", "paid", "refunded", "failed"])
          .optional(),
        admin_notes: z.string().trim().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const update = {
      ...(data.order_status ? { order_status: data.order_status } : {}),
      ...(data.payment_status ? { payment_status: data.payment_status } : {}),
      ...(data.admin_notes !== undefined ? { admin_notes: data.admin_notes } : {}),
    };

    const { error } = await supabaseAdmin.from("orders").update(update).eq("id", data.id);
    if (error) throw new Error(error.message);

    if (data.payment_status) {
      await supabaseAdmin
        .from("payment_records")
        .update({
          status: data.payment_status,
          verified_at: data.payment_status === "paid" ? new Date().toISOString() : null,
          verified_by: data.payment_status === "paid" ? context.userId : null,
        })
        .eq("order_id", data.id);
    }
    return { ok: true };
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        business_name: z.string().trim().min(2).max(200),
        tagline: z.string().trim().max(200).optional().or(z.literal("")),
        phone: z.string().trim().max(40).optional().or(z.literal("")),
        whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
        email: z.string().trim().max(200).optional().or(z.literal("")),
        address: z.string().trim().max(500).optional().or(z.literal("")),
        google_maps_url: z.string().trim().max(500).optional().or(z.literal("")),
        business_hours: z.string().trim().max(300).optional().or(z.literal("")),
        gst_number: z.string().trim().max(40).optional().or(z.literal("")),
        upi_id: z.string().trim().max(120).optional().or(z.literal("")),
        upi_payee_name: z.string().trim().max(120).optional().or(z.literal("")),
        upi_qr_url: z.string().trim().max(500).optional().or(z.literal("")),
        delivery_fee: z.number().min(0).max(100000),
        delivery_policy: z.string().trim().max(5000).optional().or(z.literal("")),
        warranty_policy: z.string().trim().max(5000).optional().or(z.literal("")),
        refund_policy: z.string().trim().max(5000).optional().or(z.literal("")),
        cancellation_policy: z.string().trim().max(5000).optional().or(z.literal("")),
        privacy_policy: z.string().trim().max(8000).optional().or(z.literal("")),
        terms: z.string().trim().max(8000).optional().or(z.literal("")),
        about_text: z.string().trim().max(8000).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, business_name, delivery_fee, ...rest } = data;
    const nullable = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [key, value === undefined || value === "" ? null : value]),
    ) as Record<string, string | null>;
    const { error } = await supabaseAdmin
      .from("business_settings")
      .update({ business_name, delivery_fee, ...nullable })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
