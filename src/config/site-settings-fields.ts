import type { AdminField } from "@/types/admin";

/** Editable site_settings fields for the website screen. */
export const websiteSettingsFields: AdminField[] = [
  { name: "logo_url", label: "Logo adresi", type: "text", full: true },
  { name: "favicon_url", label: "Favicon adresi", type: "text", full: true },
  { name: "hero_image_url", label: "Kapak görseli", type: "text", full: true },
  { name: "brand_color", label: "Marka rengi", type: "text" },
  { name: "accent_color", label: "Vurgu rengi", type: "text" },
  { name: "contact_phone", label: "Telefon", type: "text" },
  { name: "whatsapp", label: "WhatsApp", type: "text" },
  { name: "contact_email", label: "E-posta", type: "text" },
  { name: "address", label: "Adres", type: "textarea", full: true },
  { name: "map_embed_url", label: "Harita gömme adresi", type: "text", full: true },
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
