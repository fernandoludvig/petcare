import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  priceMini: z.number().min(0).optional(),
  priceSmall: z.number().min(0).optional(),
  priceMedium: z.number().min(0).optional(),
  priceLarge: z.number().min(0).optional(),
  priceGiant: z.number().min(0).optional(),
  durationMini: z.number().int().min(1).default(30),
  durationSmall: z.number().int().min(1).default(45),
  durationMedium: z.number().int().min(1).default(60),
  durationLarge: z.number().int().min(1).default(90),
  durationGiant: z.number().int().min(1).default(120),
  active: z.boolean().default(true),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

