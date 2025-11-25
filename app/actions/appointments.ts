"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { appointmentSchema, updateAppointmentSchema } from "@/lib/validations/appointment";
import { revalidatePath } from "next/cache";

export async function createAppointment(data: any) {
  try {
    const organization = await getCurrentOrganization();
    const validatedData = appointmentSchema.parse(data);

    const pet = await prisma.pet.findUnique({
      where: { id: validatedData.petId },
      include: { client: true },
    });

    if (!pet || pet.organizationId !== organization.id) {
      throw new Error("Pet não encontrado");
    }

    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    });

    if (!service || service.organizationId !== organization.id) {
      throw new Error("Serviço não encontrado");
    }

    const durationMap: Record<string, number> = {
      MINI: service.durationMini,
      SMALL: service.durationSmall,
      MEDIUM: service.durationMedium,
      LARGE: service.durationLarge,
      GIANT: service.durationGiant,
    };

    const priceMap: Record<string, number> = {
      MINI: service.priceMini || 0,
      SMALL: service.priceSmall || 0,
      MEDIUM: service.priceMedium || 0,
      LARGE: service.priceLarge || 0,
      GIANT: service.priceGiant || 0,
    };

    const duration = durationMap[pet.size] || 60;
    const endTime = new Date(validatedData.startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        organizationId: organization.id,
        status: {
          notIn: ["CANCELLED", "COMPLETED"],
        },
        OR: [
          {
            startTime: {
              lte: validatedData.startTime,
            },
            endTime: {
              gt: validatedData.startTime,
            },
          },
          {
            startTime: {
              lt: endTime,
            },
            endTime: {
              gte: endTime,
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      throw new Error("Já existe um agendamento neste horário");
    }

    await prisma.appointment.create({
      data: {
        startTime: validatedData.startTime,
        endTime,
        petId: validatedData.petId,
        clientId: validatedData.clientId,
        serviceId: validatedData.serviceId,
        assignedToId: validatedData.assignedToId,
        organizationId: organization.id,
        price: validatedData.price || priceMap[pet.size] || 0,
        notes: validatedData.notes,
      },
    });

    revalidatePath("/agendamentos");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao criar agendamento");
  }
}

export async function updateAppointment(id: string, data: any) {
  try {
    const organization = await getCurrentOrganization();
    
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    const validatedData = updateAppointmentSchema.parse(data);

    const pet = await prisma.pet.findUnique({
      where: { id: validatedData.petId },
      include: { client: true },
    });

    if (!pet || pet.organizationId !== organization.id) {
      throw new Error("Pet não encontrado");
    }

    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    });

    if (!service || service.organizationId !== organization.id) {
      throw new Error("Serviço não encontrado");
    }

    const durationMap: Record<string, number> = {
      MINI: service.durationMini,
      SMALL: service.durationSmall,
      MEDIUM: service.durationMedium,
      LARGE: service.durationLarge,
      GIANT: service.durationGiant,
    };

    const priceMap: Record<string, number> = {
      MINI: service.priceMini || 0,
      SMALL: service.priceSmall || 0,
      MEDIUM: service.priceMedium || 0,
      LARGE: service.priceLarge || 0,
      GIANT: service.priceGiant || 0,
    };

    const duration = durationMap[pet.size] || 60;
    const endTime = new Date(validatedData.startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        organizationId: organization.id,
        status: {
          notIn: ["CANCELLED", "COMPLETED"],
        },
        OR: [
          {
            startTime: {
              lte: validatedData.startTime,
            },
            endTime: {
              gt: validatedData.startTime,
            },
          },
          {
            startTime: {
              lt: endTime,
            },
            endTime: {
              gte: endTime,
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      throw new Error("Já existe um agendamento neste horário");
    }

    await prisma.appointment.update({
      where: { id },
      data: {
        startTime: validatedData.startTime,
        endTime,
        petId: validatedData.petId,
        clientId: validatedData.clientId,
        serviceId: validatedData.serviceId,
        assignedToId: validatedData.assignedToId || null,
        price: validatedData.price || priceMap[pet.size] || 0,
        notes: validatedData.notes,
        status: validatedData.status || appointment.status,
        paid: validatedData.paid !== undefined ? validatedData.paid : appointment.paid,
        paymentMethod: validatedData.paymentMethod || null,
      },
    });

    revalidatePath("/agendamentos");
    revalidatePath("/agendamentos/historico");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao atualizar agendamento");
  }
}

export async function deleteAppointment(id: string) {
  try {
    const organization = await getCurrentOrganization();

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    await prisma.appointment.delete({
      where: { id },
    });

    revalidatePath("/agendamentos");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao excluir agendamento");
  }
}

export async function markAsCompleted(id: string) {
  try {
    const organization = await getCurrentOrganization();

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    await prisma.appointment.update({
      where: { id },
      data: {
        status: "COMPLETED",
      },
    });

    revalidatePath("/agendamentos");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao marcar agendamento como realizado");
  }
}

export async function markAsPaid(id: string, paymentMethod?: string) {
  try {
    const organization = await getCurrentOrganization();

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    const validPaymentMethods = ["CASH", "DEBIT_CARD", "CREDIT_CARD", "PIX", "VOUCHER"] as const;
    const validPaymentMethod = paymentMethod && validPaymentMethods.includes(paymentMethod as any)
      ? (paymentMethod as "CASH" | "DEBIT_CARD" | "CREDIT_CARD" | "PIX" | "VOUCHER")
      : null;

    await prisma.appointment.update({
      where: { id },
      data: {
        paid: true,
        paymentMethod: validPaymentMethod,
      },
    });

    revalidatePath("/agendamentos");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao marcar agendamento como pago");
  }
}

