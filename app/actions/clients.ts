"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { clientSchema } from "@/lib/validations/client";
import { revalidatePath } from "next/cache";

export async function createClient(data: any) {
  try {
    const organization = await getCurrentOrganization();
    const validatedData = clientSchema.parse(data);

    const existingClient = await prisma.client.findFirst({
      where: {
        organizationId: organization.id,
        phone: validatedData.phone,
      },
    });

    if (existingClient) {
      throw new Error("Já existe um cliente com este telefone");
    }

    await prisma.client.create({
      data: {
        ...validatedData,
        organizationId: organization.id,
      },
    });

    revalidatePath("/clientes");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao criar cliente");
  }
}

