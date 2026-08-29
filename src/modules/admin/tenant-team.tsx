import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addTenantMember, removeTenantMember } from "@/lib/tenant-team.functions";
import { agentRepository } from "@/repositories/agent.repository";
import { formatDate } from "@/lib/format";

type MemberRow = {
  id: string;
  user_id: string;
  role: string;
  title: string | null;
  is_active: boolean;
  created_at: string;
  profiles: { email: string | null; full_name: string | null } | null;
};

const ROLE_LABELS: Record<string, string> = {
  tenant_owner: "Marka sahibi",
  tenant_staff: "Marka personeli",
};

/** Tenant team management. Authorization happens in the server functions + RLS. */
export function TenantTeam({ tenantId }: { tenantId: string }) {
  const queryClient = useQueryClient();
  const addMember = useServerFn(addTenantMember);
  const dropMember = useServerFn(removeTenantMember);
  const queryKey = ["panel", "tenant-members", tenantId];

  const { data: members = [], isPending } = useQuery({
    queryKey,
    enabled: Boolean(tenantId),
    queryFn: () => agentRepository.tenantMembers(tenantId),
  });

  const invite = useMutation({
    mutationFn: (input: { email: string; role: "tenant_owner" | "tenant_staff"; title?: string }) =>
      addMember({ data: { tenantId, ...input } }),
    onSuccess: async () => {
      toast.success("Kullanıcı markaya eklendi");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => toast.error(error.message || "Kullanıcı eklenemedi"),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => dropMember({ data: { tenantId, userId } }),
    onSuccess: async () => {
      toast.success("Kullanıcı çıkarıldı");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => toast.error(error.message || "Çıkarma başarısız"),
  });

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Marka kullanıcıları</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kayıtlı bir kullanıcıyı e-posta adresiyle markaya bağlayın. Yetkiler veritabanında doğrulanır.
        </p>
      </div>

      <form
        className="surface-card grid gap-4 p-5 sm:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const email = String(form.get("email") ?? "").trim();
          const role = String(form.get("role") ?? "tenant_staff") as "tenant_owner" | "tenant_staff";
          const title = String(form.get("title") ?? "").trim();
          if (!email) {
            toast.error("E-posta zorunludur");
            return;
          }
          invite.mutate({ email, role, ...(title ? { title } : {}) });
          event.currentTarget.reset();
        }}
      >
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="member-email">E-posta</Label>
          <Input id="member-email" name="email" type="email" placeholder="kullanici@ornek.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="member-role">Rol</Label>
          <select
            id="member-role"
            name="role"
            defaultValue="tenant_staff"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="tenant_staff">Marka personeli</option>
            <option value="tenant_owner">Marka sahibi</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="member-title">Ünvan</Label>
          <Input id="member-title" name="title" placeholder="Şube müdürü" />
        </div>
        <div className="flex justify-end sm:col-span-4">
          <Button type="submit" disabled={invite.isPending}>
            <UserPlus className="size-4" aria-hidden />
            Kullanıcı ekle
          </Button>
        </div>
      </form>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bu markaya bağlı kullanıcı yok.</p>
      ) : (
        <div className="surface-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Ünvan</TableHead>
                <TableHead>Eklendi</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(members as unknown as MemberRow[]).map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.profiles?.full_name || member.profiles?.email || member.user_id}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ROLE_LABELS[member.role] ?? member.role}</TableCell>
                  <TableCell className="text-muted-foreground">{member.title ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(member.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(member.user_id)}>
                      <Trash2 className="size-4" aria-hidden />
                      Çıkar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
