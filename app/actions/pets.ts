"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { petSchema } from "@/lib/validations/pet";
import { revalidatePath } from "next/cache";

export async function createPet(data: any) {
  try {
    const organization = await getCurrentOrganization();
    
    const { photoFile, ...dataToValidate } = data;
    const validatedData = petSchema.parse(dataToValidate);

    const client = await prisma.client.findFirst({
      where: {
        id: validatedData.clientId,
        organizationId: organization.id,
      },
    });

    if (!client) {
      throw new Error("Cliente não encontrado");
    }

    await prisma.pet.create({
      data: {
        ...validatedData,
        organizationId: organization.id,
      },
    });

    revalidatePath("/pets");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao criar pet");
  }
}

export async function deletePet(id: string) {
  try {
    const organization = await getCurrentOrganization();

    const pet = await prisma.pet.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!pet) {
      throw new Error("Pet não encontrado");
    }

    await prisma.pet.delete({
      where: { id },
    });

    revalidatePath("/pets");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao excluir pet");
  }
}

