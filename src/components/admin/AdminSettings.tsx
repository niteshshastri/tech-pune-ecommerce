import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getSettings } from "@/lib/catalog.functions";
import { adminSaveSettings } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Form = {
  id: string;
  business_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  google_maps_url: string;
  business_hours: string;
  gst_number: string;
  upi_id: string;
  upi_payee_name: string;
  upi_qr_url: string;
  delivery_fee: number;
  delivery_policy: string;
  warranty_policy: string;
  refund_policy: string;
  cancellation_policy: string;
  privacy_policy: string;
  terms: string;
  about_text: string;
};

const TEXT_FIELDS: { key: keyof Form; label: string }[] = [
  { key: "business_name", label: "Business name" },
  { key: "tagline", label: "Tagline" },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "google_maps_url", label: "Google Maps link" },
  { key: "business_hours", label: "Business hours" },
  { key: "gst_number", label: "GST number" },
  { key: "upi_id", label: "UPI ID (for customer payments)" },
  { key: "upi_payee_name", label: "UPI payee name" },
  { key: "upi_qr_url", label: "UPI QR image URL" },
];

const LONG_FIELDS: { key: keyof Form; label: string }[] = [
  { key: "address", label: "Store address" },
  { key: "about_text", label: "About us text" },
  { key: "delivery_policy", label: "Delivery policy" },
  { key: "warranty_policy", label: "Warranty policy" },
  { key: "refund_policy", label: "Refund policy" },
  { key: "cancellation_policy", label: "Cancellation policy" },
  { key: "privacy_policy", label: "Privacy policy" },
  { key: "terms", label: "Terms of service" },
];

export function AdminSettings() {
  const queryClient = useQueryClient();
  const saveSettings = useServerFn(adminSaveSettings);
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    if (!settings || form) return;
    setForm({
      id: settings.id,
      business_name: settings.business_name ?? "",
      tagline: settings.tagline ?? "",
      phone: settings.phone ?? "",
      whatsapp: settings.whatsapp ?? "",
      email: settings.email ?? "",
      address: settings.address ?? "",
      google_maps_url: settings.google_maps_url ?? "",
      business_hours: settings.business_hours ?? "",
      gst_number: settings.gst_number ?? "",
      upi_id: settings.upi_id ?? "",
      upi_payee_name: settings.upi_payee_name ?? "",
      upi_qr_url: settings.upi_qr_url ?? "",
      delivery_fee: Number(settings.delivery_fee ?? 0),
      delivery_policy: settings.delivery_policy ?? "",
      warranty_policy: settings.warranty_policy ?? "",
      refund_policy: settings.refund_policy ?? "",
      cancellation_policy: settings.cancellation_policy ?? "",
      privacy_policy: settings.privacy_policy ?? "",
      terms: settings.terms ?? "",
      about_text: settings.about_text ?? "",
    });
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: (input: Form) => saveSettings({ data: input }),
    onSuccess: async () => {
      toast.success("Settings saved");
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!form) return <p className="text-sm text-muted-foreground">Loading settings…</p>;

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(form);
      }}
    >
      {TEXT_FIELDS.map((field) => (
        <div key={String(field.key)}>
          <Label htmlFor={`s-${String(field.key)}`}>{field.label}</Label>
          <Input
            id={`s-${String(field.key)}`}
            value={String(form[field.key] ?? "")}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
          />
        </div>
      ))}
      <div>
        <Label htmlFor="s-delivery-fee">Delivery fee (₹)</Label>
        <Input
          id="s-delivery-fee"
          type="number"
          min={0}
          value={form.delivery_fee}
          onChange={(e) => setForm({ ...form, delivery_fee: Number(e.target.value) })}
        />
      </div>
      {LONG_FIELDS.map((field) => (
        <div key={String(field.key)} className="md:col-span-2">
          <Label htmlFor={`s-${String(field.key)}`}>{field.label}</Label>
          <Textarea
            id={`s-${String(field.key)}`}
            rows={4}
            value={String(form[field.key] ?? "")}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
          />
        </div>
      ))}
      <div className="md:col-span-2">
        <Button type="submit" disabled={mutation.isPending}>
          Save settings
        </Button>
      </div>
    </form>
  );
}
