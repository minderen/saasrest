import { z } from "zod";

/** QR URLs stay stable: /{tenant}/menu?branch=<uuid>&table=<no> */
export const qrMenuSearchSchema = z.object({
  branch: z.string().uuid().optional(),
  table: z.string().max(24).optional(),
});

export type QrMenuSearch = z.infer<typeof qrMenuSearchSchema>;
