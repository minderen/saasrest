import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminRepository } from "@/repositories";

type TenantOption = { id: string; name: string };

type TenantScopeValue = {
  tenantId: string;
  setTenantId: (id: string) => void;
  tenants: TenantOption[];
  loading: boolean;
};

const TenantScopeContext = createContext<TenantScopeValue | null>(null);

/**
 * Central tenant selection for the admin panel. RLS decides which tenants are
 * returned, so a super admin sees all brands while others see only their own.
 */
export function TenantScopeProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState("");
  const { data, isPending } = useQuery({
    queryKey: ["panel", "tenants"],
    queryFn: adminRepository.tenants,
  });

  const tenants = useMemo<TenantOption[]>(
    () => (data ?? []).map((tenant) => ({ id: tenant.id, name: tenant.name })),
    [data],
  );

  useEffect(() => {
    if (!tenantId && tenants[0]) setTenantId(tenants[0].id);
  }, [tenants, tenantId]);

  const value = useMemo<TenantScopeValue>(
    () => ({ tenantId, setTenantId, tenants, loading: isPending }),
    [tenantId, tenants, isPending],
  );

  return <TenantScopeContext.Provider value={value}>{children}</TenantScopeContext.Provider>;
}

export function useTenantScope() {
  const ctx = useContext(TenantScopeContext);
  if (!ctx) throw new Error("useTenantScope must be used inside TenantScopeProvider");
  return ctx;
}

export function TenantScopeSelect({ label = "Marka" }: { label?: string }) {
  const { tenantId, setTenantId, tenants } = useTenantScope();
  if (tenants.length === 0) return null;

  return (
    <div className="grid gap-2">
      <Label htmlFor="tenant-scope">{label}</Label>
      <Select value={tenantId} onValueChange={setTenantId}>
        <SelectTrigger id="tenant-scope" className="w-56">
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
  );
}
