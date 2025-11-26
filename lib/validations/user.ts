import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  role: z.enum(["ADMIN", "GROOMER", "BATHER", "ATTENDANT"]),
});

export type UserFormData = z.infer<typeof userSchema>;

