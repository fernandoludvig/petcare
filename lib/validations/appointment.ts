import { z } from "zod";

export const appointmentSchema = z.object({
  petId: z.string().min(1, "Selecione um pet"),
  clientId: z.string().min(1, "Selecione um cliente"),
  serviceId: z.string().min(1, "Selecione um serviço"),
  startTime: z.date({
    required_error: "Selecione uma data e horário",
  }),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
  price: z.number().min(0, "Preço deve ser maior ou igual a zero"),
});

export const updateAppointmentSchema = appointmentSchema.extend({
  status: z.enum(["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  paid: z.boolean().optional(),
  paymentMethod: z.enum(["CASH", "DEBIT_CARD", "CREDIT_CARD", "PIX", "VOUCHER"]).optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type UpdateAppointmentFormData = z.infer<typeof updateAppointmentSchema>;

