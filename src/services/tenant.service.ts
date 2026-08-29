import { agentRepository } from "@/repositories/agent.repository";
import { describeDatabaseError } from "@/services/resource.service";
import { slugify } from "@/lib/format";
import { tenantCreateSchema, tenantUpdateSchema } from "@/validators/tenant.validator";

/**
 * Tenant lifecycle for the agent panel. Validation here is a usability layer:
 * ownership and plan quota are enforced by RLS and database triggers.
 */
export const tenantService = {
  async create(raw: {
    agent_id: string;
    name: string;
    slug?: string;
    default_locale?: string;
    website_theme: string;
    menu_theme: string;
  }) {
    const parsed = tenantCreateSchema.safeParse({
      ...raw,
      slug: raw.slug?.trim() ? raw.slug.trim() : slugify(raw.name),
      default_locale: raw.default_locale?.trim() || "tr",
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Form geçersiz");

    try {
      return await agentRepository.createTenant(parsed.data);
    } catch (error) {
      throw new Error(describeDatabaseError(error));
    }
  },

  async update(raw: {
    id: string;
    name: string;
    default_locale: string;
    website_theme: string;
    menu_theme: string;
  }) {
    const parsed = tenantUpdateSchema.safeParse(raw);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Form geçersiz");
    const { id, ...patch } = parsed.data;
    try {
      await agentRepository.updateTenant(id, patch);
    } catch (error) {
      throw new Error(describeDatabaseError(error));
    }
  },

  async archive(id: string) {
    try {
      await agentRepository.archiveTenant(id);
    } catch (error) {
      throw new Error(describeDatabaseError(error));
    }
  },
};
