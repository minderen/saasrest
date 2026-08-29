import { supabase } from "@/integrations/supabase/client";

export const languagesRepository = {
  async listActive() {
    const { data, error } = await supabase
      .from("languages")
      .select("code, name, native_name, flag, is_default, sort_order")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
  async listAll() {
    const { data, error } = await supabase
      .from("languages")
      .select("code, name, native_name, flag, is_active, is_default, sort_order")
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
  async setActive(code: string, isActive: boolean) {
    const { error } = await supabase
      .from("languages")
      .update({ is_active: isActive })
      .eq("code", code);
    if (error) throw error;
  },
};

export const translationsRepository = {
  async byLocale(locale: string, namespace = "common") {
    const { data, error } = await supabase
      .from("translations")
      .select("key, value")
      .eq("locale", locale)
      .eq("namespace", namespace);
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  },
  async list(locale: string) {
    const { data, error } = await supabase
      .from("translations")
      .select("id, locale, namespace, key, value")
      .eq("locale", locale)
      .order("key");
    if (error) throw error;
    return data ?? [];
  },
  async update(id: string, value: string) {
    const { error } = await supabase.from("translations").update({ value }).eq("id", id);
    if (error) throw error;
  },
};
