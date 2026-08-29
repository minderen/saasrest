export function formatMoney(amount: number | string | null | undefined, currency = "TRY", locale = "tr-TR") {
  const value = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatDate(value: string | null | undefined, locale = "tr-TR") {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export function isOngoing(startsAt?: string | null, endsAt?: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  if (endsAt && endsAt < today) return false;
  if (startsAt && startsAt > today) return false;
  return true;
}

export function slugify(value: string) {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };
  return value
    .toLowerCase()
    .replace(/[çğıİöşü]/g, (char) => map[char] ?? char)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
