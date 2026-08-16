import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TITLE = "Track Your Order | All Tech IT Solution Pune";
const DESC = "Enter your order number and phone number to check the status of your order.";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Track,
});

function Track() {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Support"
        title="Track your order"
        subtitle="Use the order number from your confirmation page along with the phone number you ordered with."
      />
      <div className="container-page py-8">
        <form
          className="max-w-sm space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({
              to: "/order/$orderNumber",
              params: { orderNumber: orderNumber.trim() },
              search: { phone: phone.trim() },
            });
          }}
        >
          <div>
            <Label htmlFor="on">Order number</Label>
            <Input
              id="on"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="ATIS-XXXXXX"
            />
          </div>
          <div>
            <Label htmlFor="ph">Phone number</Label>
            <Input id="ph" required inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button type="submit">Find my order</Button>
        </form>
      </div>
    </SiteShell>
  );
}
