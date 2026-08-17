import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getCategories } from "@/lib/catalog.functions";
import { adminSaveCategory } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Draft = {
  id?: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

const EMPTY: Draft = { name: "", description: "", sort_order: 0, is_active: true };

export function AdminCategories() {
  const queryClient = useQueryClient();
  const save = useServerFn(adminSaveCategory);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const mutation = useMutation({
    mutationFn: (input: Draft) =>
      save({
        data: {
          ...(input.id ? { id: input.id } : {}),
          name: input.name,
          description: input.description,
          sort_order: input.sort_order,
          is_active: input.is_active,
        },
      }),
    onSuccess: async () => {
      toast.success("Category saved");
      setDraft(EMPTY);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Order</th>
              <th className="p-3">Active</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(categories ?? []).map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3">{c.is_active ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setDraft({
                        id: c.id,
                        name: c.name,
                        description: c.description ?? "",
                        sort_order: c.sort_order,
                        is_active: c.is_active,
                      })
                    }
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        className="space-y-4 rounded-lg border border-border p-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(draft);
        }}
      >
        <h3 className="font-display text-sm font-bold">
          {draft.id ? "Edit category" : "New category"}
        </h3>
        <div>
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            required
            maxLength={120}
          />
        </div>
        <div>
          <Label htmlFor="cat-desc">Description</Label>
          <Textarea
            id="cat-desc"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            maxLength={500}
          />
        </div>
        <div>
          <Label htmlFor="cat-order">Sort order</Label>
          <Input
            id="cat-order"
            type="number"
            min={0}
            max={999}
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="cat-active"
            checked={draft.is_active}
            onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
          />
          <Label htmlFor="cat-active">Active</Label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            Save
          </Button>
          {draft.id ? (
            <Button type="button" variant="ghost" onClick={() => setDraft(EMPTY)}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
