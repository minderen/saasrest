/**
 * Single source of truth for platform-level, non-secret configuration.
 * Anything tenant-specific belongs in the database, not here.
 */
export const appConfig = {
  name: "QR Sofra",
  tagline: "QR menü, restoran web sitesi ve sipariş yönetimi tek platformda.",
  defaultLocale: "tr",
  fallbackLocales: ["tr", "en"] as const,
  defaultDemoTenantSlug: "anatolia",
  defaultThemeKey: "theme-01",
  mediaBucket: "tenant-media",
  limits: {
    maxCartLineQuantity: 50,
    listPageSize: 100,
  },
} as const;

/** QR codes are printed once — this URL shape must stay stable forever. */
export function qrMenuPath(tenantSlug: string, branchId?: string | null, tableNo?: string | null) {
  const params = new URLSearchParams();
  if (branchId) params.set("branch", branchId);
  if (tableNo) params.set("table", tableNo);
  const query = params.toString();
  return `/${tenantSlug}/menu${query ? `?${query}` : ""}`;
}
