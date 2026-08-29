import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2, "İsim en az 2 karakter olmalı").max(120),
  email: z.string().trim().email("Geçerli bir e-posta girin").max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  plan_slug: z.string().trim().max(80).nullable().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
