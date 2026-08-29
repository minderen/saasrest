import type { UsageRow } from "@/types/billing";

const LABELS: Record<string, string> = {
  products: "Ürün",
  menus: "Menü",
  branches: "Şube",
  users: "Kullanıcı",
  orders_last_30d: "Sipariş (30 gün)",
  tenants: "Marka",
};

export function usageLabel(key: string) {
  return LABELS[key] ?? key;
}

/** Kota göstergesi. Gerçek zorlama veritabanı trigger'larında yapılır. */
export function UsageList({ rows }: { rows: UsageRow[] }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Kullanım verisi yok.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => {
        const unlimited = row.limit_value === null || row.limit_value < 0;
        const ratio = unlimited ? 0 : Math.min(1, row.used / Math.max(1, row.limit_value ?? 1));
        const full = !unlimited && row.used >= (row.limit_value ?? 0);
        return (
          <li key={row.key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span>{usageLabel(row.key)}</span>
              <span className={full ? "font-medium text-destructive" : "text-muted-foreground"}>
                {row.used} / {unlimited ? "sınırsız" : row.limit_value}
              </span>
            </div>
            {!unlimited && (
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={full ? "h-full bg-destructive" : "h-full bg-primary"}
                  style={{ width: `${Math.round(ratio * 100)}%` }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
