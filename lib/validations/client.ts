import { z } from "zod";
import { validateCPF, validatePhone } from "../utils";

export const clientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(1, "Telefone é obrigatório").refine(validatePhone, "Telefone inválido"),
  cpf: z.string().optional().refine((val) => !val || validateCPF(val), "CPF inválido").or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

