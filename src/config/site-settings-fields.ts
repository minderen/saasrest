import type { AdminField } from "@/types/admin";

/** Logo, favicon and brand visual identity. */
export const brandIdentityFields: AdminField[] = [
  { name: "logo_url", label: "Logo adresi", type: "text", full: true },
  { name: "favicon_url", label: "Favicon adresi", type: "text", full: true },
  { name: "hero_image_url", label: "Kapak görseli", type: "text", full: true },
  { name: "brand_color", label: "Marka rengi", type: "text" },
  { name: "accent_color", label: "Vurgu rengi", type: "text" },
];

/** Contact and location details shown on the brand website. */
export const contactSettingsFields: AdminField[] = [
  { name: "contact_phone", label: "Telefon", type: "text" },
  { name: "whatsapp", label: "WhatsApp", type: "text" },
  { name: "contact_email", label: "E-posta", type: "text" },
  { name: "address", label: "Adres", type: "textarea", full: true },
  { name: "map_embed_url", label: "Harita gömme adresi", type: "text", full: true },
  { name: "socials", label: "Sosyal medya (JSON)", type: "json", full: true },
];

/** Topbar strip and header action buttons. */
export const topbarHeaderFields: AdminField[] = [
  {
    name: "topbar",
    label: "Topbar (JSON)",
    type: "json",
    full: true,
    help: 'Örnek: {"enabled": true, "message": "Ücretsiz teslimat", "href": "/kampanyalar"}',
  },
  {
    name: "header_buttons",
    label: "Header butonları (JSON)",
    type: "json",
    full: true,
    help: 'Örnek: [{"label": "Rezervasyon", "href": "/iletisim"}]',
  },
];

/** Online / QR order behaviour. */
export const orderSettingsFields: AdminField[] = [
  { name: "order_enabled", label: "Sipariş özelliği açık", type: "boolean" },
  {
    name: "order_settings",
    label: "Sipariş ayarları (JSON)",
    type: "json",
    full: true,
    help: 'Örnek: {"min_total": 150, "table_required": true, "note": "Sadece salon içi"}',
  },
];

/** Editable site_settings fields for the website screen. */
export const websiteSettingsFields: AdminField[] = [
  ...brandIdentityFields,
  ...contactSettingsFields.filter((field) => field.name !== "socials"),
  { name: "order_enabled", label: "Sipariş özelliği", type: "boolean" },
];

/** SEO-only subset, edited on its own screen. */
export const seoSettingsFields: AdminField[] = [
  {
    name: "seo_title",
    label: "SEO başlığı",
    type: "text",
    full: true,
    help: "60 karakterin altında tutun.",
  },
  {
    name: "seo_description",
    label: "SEO açıklaması",
    type: "textarea",
    full: true,
    help: "160 karakterin altında tutun.",
  },
  { name: "og_image_url", label: "Paylaşım görseli (OG)", type: "text", full: true },
];
