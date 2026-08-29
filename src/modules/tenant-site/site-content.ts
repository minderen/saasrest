/**
 * Normalizers that turn free-form `site_settings` JSONB into strongly typed
 * view models for the restaurant themes. All user-facing copy comes from the
 * database; these helpers only shape it and provide safe fallbacks.
 */

export type TopbarItemType = "text" | "link" | "button" | "modal" | "language";

export type TopbarItem = {
  id: string;
  type: TopbarItemType;
  label: string;
  href: string | null;
  target: "_self" | "_blank";
  variant: "default" | "secondary" | "outline" | "ghost";
  icon: string | null;
  modal_title: string | null;
  modal_html: string | null;
  sort_order: number;
};

export type TopbarAlign = "left" | "center" | "right";
export type TopbarColumn = { align: TopbarAlign; items: TopbarItem[] };
export type TopbarRow = { id: string; is_active: boolean; columns: TopbarColumn[] };
export type Topbar = { enabled: boolean; rows: TopbarRow[] };

export type HeaderButton = {
  id: string;
  label: string;
  href: string | null;
  target: "_self" | "_blank";
  variant: "default" | "secondary" | "outline" | "ghost";
  type: "link" | "modal";
  modal_title: string | null;
  modal_html: string | null;
  sort_order: number;
};

export type SocialLink = { id: string; label: string; href: string };

const ALIGNMENTS: TopbarAlign[] = ["left", "center", "right"];
const VARIANTS = new Set(["default", "secondary", "outline", "ghost"]);

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function bool(value: unknown, fallback = true): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function target(value: unknown): "_self" | "_blank" {
  return value === "_blank" || value === "blank" ? "_blank" : "_self";
}

function variant(value: unknown): TopbarItem["variant"] {
  return typeof value === "string" && VARIANTS.has(value)
    ? (value as TopbarItem["variant"])
    : "default";
}

function itemType(raw: Record<string, unknown>): TopbarItemType {
  const declared = text(raw["type"]);
  if (declared === "language" || declared === "modal" || declared === "button" || declared === "link")
    return declared;
  if (raw["modal_html"] || raw["modal"]) return "modal";
  if (raw["href"]) return "link";
  return "text";
}

function toItem(raw: unknown, index: number, prefix: string): TopbarItem | null {
  const record = asRecord(raw);
  const type = itemType(record);
  const label = text(record["label"]) ?? text(record["text"]) ?? text(record["message"]) ?? "";
  if (type !== "language" && label === "") return null;
  if (bool(record["is_active"]) === false) return null;

  return {
    id: text(record["id"]) ?? `${prefix}-${index}`,
    type,
    label,
    href: text(record["href"]) ?? text(record["url"]),
    target: target(record["target"]),
    variant: variant(record["variant"]),
    icon: text(record["icon"]),
    modal_title: text(record["modal_title"]) ?? (type === "modal" ? label : null),
    modal_html: text(record["modal_html"]) ?? text(record["modal"]),
    sort_order: typeof record["sort_order"] === "number" ? record["sort_order"] : index,
  };
}

function toColumn(raw: unknown, rowIndex: number, columnIndex: number): TopbarColumn {
  const record = asRecord(raw);
  const rawItems = Array.isArray(record["items"])
    ? (record["items"] as unknown[])
    : Array.isArray(raw)
      ? (raw as unknown[])
      : [];
  const items = rawItems
    .map((item, index) => toItem(item, index, `r${rowIndex}c${columnIndex}`))
    .filter((item): item is TopbarItem => item !== null)
    .sort((a, b) => a.sort_order - b.sort_order);

  const align = text(record["align"]);
  return {
    align: ALIGNMENTS.includes(align as TopbarAlign)
      ? (align as TopbarAlign)
      : (ALIGNMENTS[columnIndex] ?? "left"),
    items,
  };
}

/** Legacy single-message topbar → the row/column model. */
function legacyRows(record: Record<string, unknown>): TopbarRow[] {
  const message = text(record["message"]);
  const linkLabel = text(record["link_label"]);
  const href = text(record["href"]) ?? text(record["link_href"]);
  const items: TopbarItem[] = [];

  if (message) {
    items.push({
      id: "legacy-message",
      type: "text",
      label: message,
      href: null,
      target: "_self",
      variant: "default",
      icon: null,
      modal_title: null,
      modal_html: null,
      sort_order: 0,
    });
  }
  if (linkLabel && href) {
    items.push({
      id: "legacy-link",
      type: "button",
      label: linkLabel,
      href,
      target: target(record["target"]),
      variant: "default",
      icon: null,
      modal_title: null,
      modal_html: null,
      sort_order: 1,
    });
  }
  if (items.length === 0) return [];

  return [
    {
      id: "legacy-row",
      is_active: true,
      columns: [
        { align: "left", items: items.filter((item) => item.type === "text") },
        { align: "center", items: [] },
        { align: "right", items: items.filter((item) => item.type !== "text") },
      ],
    },
  ];
}

/**
 * Topbar model: up to two rows, each with three columns of ordered items
 * (text, link, button, modal trigger or the language switcher).
 */
export function normalizeTopbar(value: unknown): Topbar {
  const record = asRecord(value);
  const enabled = bool(record["enabled"]);
  const rawRows = Array.isArray(record["rows"]) ? (record["rows"] as unknown[]) : [];

  const rows: TopbarRow[] = rawRows
    .map((rawRow, rowIndex) => {
      const row = asRecord(rawRow);
      const rawColumns = Array.isArray(row["columns"]) ? (row["columns"] as unknown[]) : [];
      const columns = [0, 1, 2].map((columnIndex) =>
        toColumn(rawColumns[columnIndex], rowIndex, columnIndex),
      );
      return {
        id: text(row["id"]) ?? `row-${rowIndex}`,
        is_active: bool(row["is_active"]),
        columns,
        sort_order: typeof row["sort_order"] === "number" ? row["sort_order"] : rowIndex,
      };
    })
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter((row) => row.is_active && row.columns.some((column) => column.items.length > 0))
    .slice(0, 2)
    .map(({ id, is_active, columns }) => ({ id, is_active, columns }));

  return { enabled, rows: rows.length > 0 ? rows : legacyRows(record) };
}

/** Header action buttons (maximum two, ordered). */
export function normalizeHeaderButtons(value: unknown): HeaderButton[] {
  const list = Array.isArray(value)
    ? (value as unknown[])
    : Array.isArray(asRecord(value)["items"])
      ? (asRecord(value)["items"] as unknown[])
      : [];

  return list
    .map((raw, index) => {
      const record = asRecord(raw);
      const label = text(record["label"]) ?? text(record["text"]);
      if (!label || bool(record["is_active"]) === false) return null;
      const modalHtml = text(record["modal_html"]) ?? text(record["modal"]);
      return {
        id: text(record["id"]) ?? `header-${index}`,
        label,
        href: text(record["href"]) ?? text(record["url"]),
        target: target(record["target"]),
        variant: variant(record["variant"]),
        type: modalHtml ? ("modal" as const) : ("link" as const),
        modal_title: text(record["modal_title"]) ?? label,
        modal_html: modalHtml,
        sort_order: typeof record["sort_order"] === "number" ? record["sort_order"] : index,
      };
    })
    .filter((button): button is HeaderButton => button !== null)
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 2);
}

/** Social links from either `{instagram: url}` or `[{label, href}]` shapes. */
export function normalizeSocials(value: unknown): SocialLink[] {
  if (Array.isArray(value)) {
    return value
      .map((raw, index) => {
        const record = asRecord(raw);
        const href = text(record["href"]) ?? text(record["url"]);
        const label = text(record["label"]) ?? text(record["name"]) ?? href;
        return href && label ? { id: `social-${index}`, label, href } : null;
      })
      .filter((link): link is SocialLink => link !== null);
  }

  return Object.entries(asRecord(value))
    .map(([key, raw]) => {
      const href = text(raw);
      return href ? { id: key, label: key, href } : null;
    })
    .filter((link): link is SocialLink => link !== null);
}
