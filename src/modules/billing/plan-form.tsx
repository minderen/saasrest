import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { planUpsertSchema, type PlanUpsertInput } from "@/validators/plan.validator";
import type { PlanRecord } from "@/types/billing";
import { slugify } from "@/lib/format";

type Props = {
  plan?: PlanRecord;
  pending?: boolean;
  onSubmit: (input: PlanUpsertInput) => void;
  onCancel: () => void;
};

/** Süper admin plan oluşturma/düzenleme formu (agent + tenant planları). */
export function PlanForm({ plan, pending, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    kind: plan?.kind ?? "tenant",
    slug: plan?.slug ?? "",
    name: plan?.name ?? "",
    tagline: plan?.tagline ?? "",
    price_monthly: String(plan?.price_monthly ?? 0),
    price_yearly: plan?.price_yearly === null || plan?.price_yearly === undefined ? "" : String(plan.price_yearly),
    currency: plan?.currency ?? "TRY",
    is_active: plan?.is_active ?? true,
    is_featured: plan?.is_featured ?? false,
    sort_order: String(plan?.sort_order ?? 0),
  });
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const parsed = planUpsertSchema.safeParse({
      ...(plan?.id ? { id: plan.id } : {}),
      kind: form.kind,
      slug: form.slug || slugify(form.name),
      name: form.name.trim(),
      tagline: form.tagline.trim() || null,
      price_monthly: Number(form.price_monthly),
      price_yearly: form.price_yearly === "" ? null : Number(form.price_yearly),
      currency: form.currency.toUpperCase(),
      is_active: form.is_active,
      is_featured: form.is_featured,
      sort_order: Number(form.sort_order),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Form geçersiz");
      return;
    }
    setError(null);
    onSubmit(parsed.data);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Plan tipi</Label>
          <Select value={form.kind} onValueChange={(value) => setForm((s) => ({ ...s, kind: value as "agent" | "tenant" }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agent">Acente planı</SelectItem>
              <SelectItem value="tenant">Marka planı</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="plan-name">Plan adı</Label>
          <Input
            id="plan-name"
            value={form.name}
            onChange={(event) => setForm((s) => ({ ...s, name: event.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="plan-slug">Slug</Label>
          <Input
            id="plan-slug"
            value={form.slug}
            placeholder={slugify(form.name)}
            onChange={(event) => setForm((s) => ({ ...s, slug: event.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="plan-tagline">Kısa açıklama</Label>
          <Input
            id="plan-tagline"
            value={form.tagline}
            onChange={(event) => setForm((s) => ({ ...s, tagline: event.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="plan-monthly">Aylık fiyat</Label>
          <Input
            id="plan-monthly"
            type="number"
            min={0}
            value={form.price_monthly}
            onChange={(event) => setForm((s) => ({ ...s, price_monthly: event.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="plan-yearly">Yıllık fiyat (opsiyonel)</Label>
          <Input
            id="plan-yearly"
            type="number"
            min={0}
            value={form.price_yearly}
            onChange={(event) => setForm((s) => ({ ...s, price_yearly: event.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="plan-currency">Para birimi</Label>
          <Input
            id="plan-currency"
            maxLength={3}
            value={form.currency}
            onChange={(event) => setForm((s) => ({ ...s, currency: event.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="plan-order">Sıra</Label>
          <Input
            id="plan-order"
            type="number"
            min={0}
            value={form.sort_order}
            onChange={(event) => setForm((s) => ({ ...s, sort_order: event.target.value }))}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.is_active} onCheckedChange={(value) => setForm((s) => ({ ...s, is_active: value }))} />
          Aktif
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.is_featured} onCheckedChange={(value) => setForm((s) => ({ ...s, is_featured: value }))} />
          Öne çıkan
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} type="button">
          Vazgeç
        </Button>
        <Button onClick={submit} disabled={pending} type="button">
          {plan ? "Kaydet" : "Plan oluştur"}
        </Button>
      </div>
    </div>
  );
}
