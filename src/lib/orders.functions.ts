import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const phoneRegex = /^[0-9+\-\s]{8,15}$/;

const placeOrderSchema = z.object({
  items: z
    .array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
    .min(1)
    .max(30),
  customer_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  address_line1: z.string().trim().min(4).max(250),
  address_line2: z.string().trim().max(250).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().max(80).optional().or(z.literal("")),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "Enter a valid 6-digit pincode"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => placeOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const { getOptionalUserId } = await import("./auth.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = await getOptionalUserId();

    const { data: result, error } = await supabaseAdmin.rpc("place_order", {
      _items: data.items,
      _customer_name: data.customer_name,
      _phone: data.phone,
      _email: data.email ?? "",
      _address_line1: data.address_line1,
      _address_line2: data.address_line2 ?? "",
      _city: data.city,
      _state: data.state ?? "Maharashtra",
      _pincode: data.pincode,
      _notes: data.notes ?? "",
      _user_id: userId as string,
    });

    if (error) throw new Error(error.message);
    const row = Array.isArray(result) ? result[0] : result;
    if (!row) throw new Error("Order could not be created. Please try again.");
    return {
      order_number: (row as { order_number: string }).order_number,
      total: Number((row as { total: number }).total),
    };
  });

/** Submits a UPI reference. This NEVER marks an order paid - only an admin can verify. */
export const submitPaymentReference = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        order_number: z.string().trim().max(40),
        phone: z.string().trim().regex(phoneRegex),
        reference: z.string().trim().min(4).max(80),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, phone, payment_status, total")
      .eq("order_number", data.order_number)
      .maybeSingle();

    if (!order || order.phone !== data.phone) throw new Error("Order not found.");
    if (order.payment_status === "paid") return { ok: true };

    await supabaseAdmin
      .from("orders")
      .update({
        upi_reference: data.reference,
        payment_status: "verification_pending",
        order_status: "verification_pending",
      })
      .eq("id", order.id);

    await supabaseAdmin
      .from("payment_records")
      .update({
        reference: data.reference,
        status: "verification_pending",
        submitted_at: new Date().toISOString(),
      })
      .eq("order_id", order.id);

    return { ok: true };
  });

export const getOrderByNumber = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        order_number: z.string().trim().max(40),
        phone: z.string().trim().regex(phoneRegex),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, customer_name, phone, email, address_line1, address_line2, city, state, pincode, notes, subtotal, delivery_fee, total, payment_status, order_status, upi_reference, created_at, order_items(id, product_name, product_slug, unit_price, quantity, line_total)",
      )
      .eq("order_number", data.order_number)
      .maybeSingle();

    if (!order || order.phone !== data.phone) return null;
    const { order_items, ...rest } = order as Record<string, unknown> & { order_items: unknown[] };
    return { ...rest, items: order_items ?? [] };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("orders")
      .select(
        "id, order_number, total, payment_status, order_status, created_at, order_items(id, product_name, quantity, unit_price, line_total)",
      )
      .order("created_at", { ascending: false });
    return data ?? [];
  });
