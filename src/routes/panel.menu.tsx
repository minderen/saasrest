import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbox } from "@/components/shared/lightbox";
import { adminRepository, tenantContentRepository } from "@/repositories/admin";
import { formatMoney, slugify } from "@/lib/format";

export const Route = createFileRoute("/panel/menu")({
  component: MenuAdminPage,
});

const productSchema = z.object({
  name: z.string().trim().min(2, "Ürün adı en az 2 karakter"),
  category_id: z.string().uuid("Kategori seçin"),
  price: z.number().nonnegative("Fiyat negatif olamaz"),
  short_description: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  image_url: z.string().trim().url("Geçerli bir görsel adresi girin").optional().or(z.literal("")),
});

type ProductRow = {
  id: string;
  name: string;
  category_id: string | null;
  price: number;
  currency: string;
  short_description: string | null;
  description?: string | null;
  image_url: string | null;
  status: string;
};

function MenuAdminPage() {
  const queryClient = useQueryClient();
  const [tenantId, setTenantId] = useState("");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [open, setOpen] = useState(false);

  const { data: tenants = [] } = useQuery({ queryKey: ["panel", "tenants"], queryFn: adminRepository.tenants });
  useEffect(() => {
    if (!tenantId && tenants[0]) setTenantId(tenants[0].id);
  }, [tenants, tenantId]);

  const enabled = Boolean(tenantId);
  const { data: categories = [] } = useQuery({
    queryKey: ["panel", "categories", tenantId],
    queryFn: () => tenantContentRepository.categories(tenantId),
    enabled,
  });
  const { data: products = [], isPending } = useQuery({
    queryKey: ["panel", "products", tenantId],
    queryFn: () => tenantContentRepository.products(tenantId),
    enabled,
  });

  const save = useMutation({
    mutationFn: (input: Record<string, unknown> & { id?: string }) =>
      tenantContentRepository.saveProduct(tenantId, input),
    onSuccess: async () => {
      toast.success("Ürün kaydedildi");
      setOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["panel", "products", tenantId] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Kayıt başarısız"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => tenantContentRepository.softDeleteProduct(id),
    onSuccess: async () => {
      toast.success("Ürün arşivlendi");
      await queryClient.invalidateQueries({ queryKey: ["panel", "products", tenantId] });
    },
    onError: () => toast.error("Silme başarısız"),
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = productSchema.safeParse({
      name: String(formData.get("name") ?? ""),
      category_id: String(formData.get("category_id") ?? ""),
      price: Number(formData.get("price") ?? 0),
      short_description: String(formData.get("short_description") ?? ""),
      description: String(formData.get("description") ?? ""),
      image_url: String(formData.get("image_url") ?? ""),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Form geçersiz");
      return;
    }
    save.mutate({
      ...(editing ? { id: editing.id } : {}),
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
      category_id: parsed.data.category_id,
      price: parsed.data.price,
      short_description: parsed.data.short_description || null,
      description: parsed.data.description || null,
      image_url: parsed.data.image_url || null,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Menü yönetimi</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ürünleri ekleyin, düzenleyin ve arşivleyin.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-2">
            <Label htmlFor="tenant-select">Marka</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger id="tenant-select" className="w-56">
                <SelectValue placeholder="Marka seçin" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            disabled={!enabled}
          >
            <Plus className="size-4" aria-hidden />
            Yeni ürün
          </Button>
        </div>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(products as unknown as ProductRow[]).map((product) => (
            <li key={product.id} className="surface-card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{product.name}</h2>
                  <p className="text-sm text-muted-foreground">{product.short_description}</p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {formatMoney(product.price, product.currency)}
                </span>
              </div>
              <div className="mt-auto flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditing(product);
                    setOpen(true);
                  }}
                >
                  <Pencil className="size-4" aria-hidden />
                  Düzenle
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(product.id)}>
                  <Trash2 className="size-4" aria-hidden />
                  Arşivle
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Lightbox open={open} onOpenChange={setOpen} title={editing ? "Ürünü düzenle" : "Yeni ürün"}>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="product-name">Ürün adı</Label>
            <Input id="product-name" name="name" defaultValue={editing?.name ?? ""} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-category">Kategori</Label>
            <select
              id="product-category"
              name="category_id"
              defaultValue={editing?.category_id ?? ""}
              required
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Seçin</option>
              {(categories as Array<{ id: string; name: string }>).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-price">Fiyat</Label>
            <Input id="product-price" name="price" type="number" min={0} step="0.01" defaultValue={editing?.price ?? 0} required />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="product-short">Kısa açıklama</Label>
            <Input id="product-short" name="short_description" defaultValue={editing?.short_description ?? ""} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="product-description">Açıklama</Label>
            <Textarea id="product-description" name="description" rows={4} defaultValue={editing?.description ?? ""} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="product-image">Görsel adresi</Label>
            <Input id="product-image" name="image_url" defaultValue={editing?.image_url ?? ""} />
          </div>
          <Button type="submit" className="sm:col-span-2" disabled={save.isPending}>
            Kaydet
          </Button>
        </form>
      </Lightbox>
    </div>
  );
}
