import { resourceRepository, type ResourceRow } from "@/repositories/resource.repository";
import { slugify } from "@/lib/format";
import type { AdminField, AdminResource } from "@/types/admin";

/** Maps database failures to safe, user-facing Turkish messages. */
export function describeDatabaseError(error: unknown): string {
  const candidate = error as { code?: string; message?: string } | null;
  const code = candidate?.code ?? "";
  const message = candidate?.message ?? "";

  if (code === "23514" || message.includes("Plan limiti") || message.includes("kotası")) {
    return message || "Plan limitine ulaşıldı. Devam etmek için planı yükseltin.";
  }
  if (code === "42501" || message.toLowerCase().includes("row-level security")) {
    return "Bu işlem için yetkiniz bulunmuyor.";
  }
  if (code === "23505") return "Bu kayıt zaten mevcut (benzersiz alan çakışması).";
  if (code === "23503") return "İlişkili kayıt bulunamadı; seçimlerinizi kontrol edin.";
  if (message.startsWith("Bu ") || message.startsWith("Sipariş")) return message;
  return message || "İşlem tamamlanamadı.";
}

type FormValue = FormDataEntryValue | null;

function readField(field: AdminField, raw: FormValue, form: FormData): unknown {
  const text = typeof raw === "string" ? raw.trim() : "";

  switch (field.type) {
    case "boolean":
      return raw === "on" || raw === "true";
    case "number":
      return text === "" ? null : Number(text);
    case "json": {
      if (text === "") return {};
      return JSON.parse(text) as unknown;
    }
    case "date":
      return text === "" ? null : text;
    default: {
      if (text === "" && field.slugFrom) {
        const source = form.get(field.slugFrom);
        return typeof source === "string" && source.trim() ? slugify(source) : null;
      }
      return text === "" ? null : text;
    }
  }
}

/** Builds a validated payload from a form; throws with a friendly message. */
export function buildResourceValues(resource: AdminResource, form: FormData): ResourceRow {
  const values: ResourceRow = {};

  for (const field of resource.fields) {
    let value: unknown;
    try {
      value = readField(field, form.get(field.name), form);
    } catch {
      throw new Error(`${field.label} geçerli bir JSON değeri olmalı.`);
    }
    if (field.required && (value === null || value === "")) {
      throw new Error(`${field.label} zorunludur.`);
    }
    if (field.type === "number" && value !== null && Number.isNaN(value as number)) {
      throw new Error(`${field.label} sayısal olmalıdır.`);
    }
    values[field.name] = value;
  }

  return values;
}

export const resourceService = {
  async list(resource: AdminResource, tenantId?: string | null, filter?: Record<string, unknown>) {
    try {
      return await resourceRepository.list({
        table: resource.table,
        ...(resource.select ? { select: resource.select } : {}),
        ...(resource.orderBy ? { orderBy: resource.orderBy } : {}),
        ...(resource.ascending === undefined ? {} : { ascending: resource.ascending }),
        filter: { ...(resource.filter ?? {}), ...(filter ?? {}) },
        ...(resource.tenantScoped ? { tenantId: tenantId ?? null } : {}),
        ...(resource.softDelete ? { softDelete: true } : {}),
        ...(resource.limit ? { limit: resource.limit } : {}),
      });
    } catch (error) {
      throw new Error(describeDatabaseError(error));
    }
  },

  async save(resource: AdminResource, values: ResourceRow, id?: unknown, tenantId?: string | null) {
    const primaryKey = resource.primaryKey ?? "id";
    const payload: ResourceRow = { ...values };
    if (resource.tenantScoped) {
      if (!tenantId) throw new Error("Önce bir marka seçin.");
      payload["tenant_id"] = tenantId;
    }

    try {
      if (id === undefined || id === null || id === "") {
        await resourceRepository.insert(resource.table, payload);
      } else {
        await resourceRepository.update(resource.table, primaryKey, id, payload);
      }
    } catch (error) {
      throw new Error(describeDatabaseError(error));
    }
  },

  /** Draft / published / archived transition for content resources. */
  async setStatus(resource: AdminResource, id: unknown, status: "draft" | "published" | "archived") {
    const primaryKey = resource.primaryKey ?? "id";
    const patch: ResourceRow = { status };
    if (resource.table === "posts" && status === "published") {
      patch["published_at"] = new Date().toISOString();
    }
    try {
      await resourceRepository.update(resource.table, primaryKey, id, patch);
    } catch (error) {
      throw new Error(describeDatabaseError(error));
    }
  },

  async remove(resource: AdminResource, id: unknown) {
    const primaryKey = resource.primaryKey ?? "id";
    try {
      if (resource.softDelete) await resourceRepository.softDelete(resource.table, primaryKey, id);
      else await resourceRepository.remove(resource.table, primaryKey, id);
    } catch (error) {
      throw new Error(describeDatabaseError(error));
    }
  },
};
