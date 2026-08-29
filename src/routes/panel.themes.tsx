import { createFileRoute } from "@tanstack/react-router";

import { RequireAccess } from "@/modules/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { adminRepository } from "@/repositories";

export const Route = createFileRoute("/panel/themes")({
  component: GuardedPage,
});

const SCOPES: Record<string, string> = {
  superadmin: "Tanıtım sitesi",
  restaurant: "Restoran sitesi",
  menu: "QR menü",
};

function ThemesPage() {
  const queryClient = useQueryClient();
  const { data: themes = [], isPending } = useQuery({ queryKey: ["panel", "themes"], queryFn: adminRepository.themes });

  const toggle = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) => adminRepository.toggleTheme(id, value),
    onSuccess: async () => {
      toast.success("Tema güncellendi");
      await queryClient.invalidateQueries({ queryKey: ["panel", "themes"] });
    },
    onError: () => toast.error("Güncelleme başarısız"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Temalar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tema kayıtları modülerdir: yeni tema eklendiğinde markalar tema seçiminde görebilir.
        </p>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {themes.map((theme) => (
            <li key={theme.id} className="surface-card flex flex-col gap-2 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {SCOPES[theme.scope] ?? theme.scope}
                  </p>
                  <h2 className="text-lg font-semibold">{theme.name}</h2>
                </div>
                <Switch
                  checked={theme.is_active}
                  aria-label={`${theme.name} aktifliği`}
                  onCheckedChange={(value) => toggle.mutate({ id: theme.id, value })}
                />
              </div>
              <p className="text-sm text-muted-foreground">{theme.description}</p>
              <p className="text-xs text-muted-foreground">
                {theme.slug} · v{theme.version}
                {theme.is_default ? " · varsayılan" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GuardedPage() {
  return (
    <RequireAccess scope="super">
      <ThemesPage />
    </RequireAccess>
  );
}
