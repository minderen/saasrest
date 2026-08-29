import { landingRepository } from "@/repositories/landing.repository";
import { leadSchema, type LeadInput } from "@/validators/lead.validator";

/** Business rules for inbound SaaS demo/contact requests. */
export const leadService = {
  async submit(input: LeadInput) {
    const parsed = leadSchema.parse(input);
    await landingRepository.createLead({
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone || null,
      company: parsed.company || null,
      message: parsed.message || null,
      plan_slug: parsed.plan_slug ?? null,
    });
  },
};

export type { LeadInput };
export { leadSchema };
