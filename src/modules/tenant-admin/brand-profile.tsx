import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { agentRepository } from "@/repositories/agent.repository";
import { languagesRepository } from "@/repositories/i18n.repository";
import { tenantService } from "@/services/tenant.service";
import { useTenantScope } from "@/modules/admin/tenant-scope";

/**
 * Brand identity form (name, default locale, themes). The tenant row is fetched
 * under RLS, so a tenant user can only ever load and update its own brand.
 */
export function BrandProfileForm() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();
  const queryKey = ["panel", "brand", tenantId];

  const { data: tenant, isPending } = useQuery({
    queryKey,
    enabled: Boolean(tenantId),
    queryFn: () => agentRepository.tenantById(tenantId),
  });
  const { data: languages = [] } = useQuery({
    queryKey: ["panel", "languages", "active"],
    queryFn: languagesRepository.active,
  });
  const { data: siteThemes = [] } = useQuery({
    queryKey: ["panel", "themes", "restaurant"],
    queryFn: () => agentRepository.themes("restaurant"),
  });
  const { data: menuThemes = [] } = useQuery({
    queryKey: ["panel", "themes", "menu"],
    queryFn: () => agentRepository.themes("menu"),
  });

  const save = useMutation({
    mutationFn: async (form: FormData) => {
      await tenantService.update({
        id: tenantId,
        name: String(form.get("name") ?? ""),
        default_locale: String(form.get("default_locale") ?? "tr"),
        website_theme: String(form.get("website_theme") ?? ""),
        menu_theme: String(form.get("menu_theme") ?? ""),
      });
    },
    onSuccess: async () => {
      toast.success("Marka bilgileri kaydedildi");
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries({ queryKey: ["panel", "tenants"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Kayıt başarısız"),
  });

  if (!tenantId) return <p className="text-sm text-muted-foreground">Devam etmek için bir marka seçin.</p>;
  if (isPending) return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;
  if (!tenant) {
    return (
      <p className="text-sm text-muted-foreground">
        Marka bulunamadı veya bu markaya erişim yetkiniz yok.
      </p>
    );
  }

  return (
    <form
      key={tenantId}
      className="surface-card grid gap-4 p-5 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate(new FormData(event.currentTarget));
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="brand-name">Marka adı</Label>
        <Input id="brand-name" name="name" defaultValue={String(tenant.name ?? "")} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="brand-slug">Adres anahtarı (slug)</Label>
        <Input id="brand-slug" value={String(tenant.slug ?? "")} readOnly disabled />
        <p className="text-xs text-muted-foreground">
          Slug yalnızca platform yöneticisi tarafından değiştirilebilir.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="brand-locale">Varsayılan dil</Label>
        <Select name="default_locale" defaultValue={String(tenant.default_locale ?? "tr")}>
          <SelectTrigger id="brand-locale">
            <SelectValue placeholder="Dil seçin" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.native_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="brand-site-theme">Website teması</Label>
        <Select name="website_theme" defaultValue={String(tenant.website_theme ?? "")}>
          <SelectTrigger id="brand-site-theme">
            <SelectValue placeholder="Tema seçin" />
          </SelectTrigger>
          <SelectContent>
            {siteThemes.map((theme) => (
              <SelectItem key={theme.slug} value={theme.slug}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="brand-menu-theme">QR menü teması</Label>
        <Select name="menu_theme" defaultValue={String(tenant.menu_theme ?? "")}>
          <SelectTrigger id="brand-menu-theme">
            <SelectValue placeholder="Tema seçin" />
          </SelectTrigger>
          <SelectContent>
            {menuThemes.map((theme) => (
              <SelectItem key={theme.slug} value={theme.slug}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end justify-end sm:col-span-2">
        <Button type="submit" disabled={save.isPending}>
          Kaydet
        </Button>
      </div>
    </form>
  );
}
