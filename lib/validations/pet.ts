import { z } from "zod";

export const petSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  species: z.enum(["DOG", "CAT", "OTHER"]),
  breed: z.string().optional(),
  size: z.enum(["MINI", "SMALL", "MEDIUM", "LARGE", "GIANT"]),
  weight: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? undefined : num;
    }),
  birthDate: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      return typeof val === "string" ? new Date(val) : val;
    }),
  color: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional().or(z.literal("")).transform((val) => val === "" ? undefined : val),
  medicalNotes: z.string().optional(),
  behaviorNotes: z.string().optional(),
  photoUrl: z.string().optional().or(z.literal("")).transform((val) => val === "" ? undefined : val),
  photoFile: z.any().optional(), // Não validar File no servidor
  clientId: z.string().min(1, "Selecione um cliente"),
});

export type PetFormData = z.infer<typeof petSchema>;

