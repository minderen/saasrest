import { supabase } from "@/integrations/supabase/client";

import type { LandingSection } from "@/types";

export const landingRepository = {
  async announcement(locale: string) {
    const { data, error } = await supabase
      .from("announcements")
      .select("id, message, link_label, link_href")
      .eq("locale", locale)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async sections(locale: string) {
    const { data, error } = await supabase
      .from("landing_sections")
      .select("id, key, eyebrow, title, subtitle, body, media_url, config, sort_order")
      .eq("locale", locale)
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as unknown as LandingSection[];
  },

  async features(locale: string) {
    const { data, error } = await supabase
      .from("landing_features")
      .select("id, icon, title, description, detail_html, sort_order")
      .eq("locale", locale)
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async faqs(locale: string) {
    const { data, error } = await supabase
      .from("landing_faqs")
      .select("id, question, answer, sort_order")
      .eq("locale", locale)
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async plans() {
    const { data, error } = await supabase
      .from("plans")
      .select(
        "id, kind, slug, name, tagline, price_monthly, price_yearly, currency, features, limits, is_featured, sort_order",
      )
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async settings(key: string) {
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    return (data?.value ?? {}) as Record<string, string>;
  },

  async createLead(input: {
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    message?: string | null;
    plan_slug?: string | null;
  }) {
    const { error } = await supabase.from("leads").insert(input);
    if (error) throw error;
  },
};
