import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  email: z.union([z.literal(""), z.string().trim().email().max(160)]).default(""),
  message: z.string().trim().min(5).max(4000),
  locale: z.enum(["az", "en", "ru"]).default("az"),
  page: z.string().trim().max(200).optional().default(""),
  product: z.string().trim().max(120).optional().default(""),
});
