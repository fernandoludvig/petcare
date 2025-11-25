"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { serviceSchema } from "@/lib/validations/service";
import { revalidatePath } from "next/cache";

export async function createService(data: any) {
  try {
    const organization = await getCurrentOrganization();
    const validatedData = serviceSchema.parse(data);

    await prisma.service.create({
      data: {
        ...validatedData,
        organizationId: organization.id,
      },
    });

    revalidatePath("/servicos");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao criar serviço");
  }
}

export async function updateService(id: string, data: any) {
  try {
    const organization = await getCurrentOrganization();
    const validatedData = serviceSchema.parse(data);

    const service = await prisma.service.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!service) {
      throw new Error("Serviço não encontrado");
    }

    await prisma.service.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/servicos");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao atualizar serviço");
  }
}

export async function deleteService(id: string) {
  try {
    const organization = await getCurrentOrganization();

    const service = await prisma.service.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!service) {
      throw new Error("Serviço não encontrado");
    }

    await prisma.service.delete({
      where: { id },
    });

    revalidatePath("/servicos");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao excluir serviço");
  }
}


