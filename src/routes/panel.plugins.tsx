import { createFileRoute } from "@tanstack/react-router";

import { RequireAccess } from "@/modules/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { adminRepository } from "@/repositories";

export const Route = createFileRoute("/panel/plugins")({
  component: GuardedPage,
});

function PluginsPage() {
  const queryClient = useQueryClient();
  const { data: plugins = [], isPending } = useQuery({
    queryKey: ["panel", "plugins"],
    queryFn: adminRepository.plugins,
  });

  const toggle = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      adminRepository.togglePlugin(id, value),
    onSuccess: async () => {
      toast.success("Eklenti güncellendi");
      await queryClient.invalidateQueries({ queryKey: ["panel", "plugins"] });
    },
    onError: () => toast.error("Güncelleme başarısız"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Eklentiler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Eklentiler çekirdek kodu değiştirmeden özellik ekler; plan ve markalara atanabilir.
        </p>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plugins.map((plugin) => (
            <li key={plugin.id} className="surface-card flex flex-col gap-2 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {plugin.scope}
                  </p>
                  <h2 className="text-lg font-semibold">{plugin.name}</h2>
                </div>
                <Switch
                  checked={plugin.is_active}
                  aria-label={`${plugin.name} aktifliği`}
                  onCheckedChange={(value) => toggle.mutate({ id: plugin.id, value })}
                />
              </div>
              <p className="text-sm text-muted-foreground">{plugin.description}</p>
              <p className="text-xs text-muted-foreground">
                {plugin.slug} · v{plugin.version}
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
      <PluginsPage />
    </RequireAccess>
  );
}
