"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization, getCurrentUser } from "@/lib/auth";
import { userSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";

export async function createUser(data: any) {
  try {
    const organization = await getCurrentOrganization();
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new Error("Apenas administradores podem criar usuários");
    }

    const validatedData = userSchema.parse(data);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new Error("Já existe um usuário com este email");
    }

    const clerk = await clerkClient();

    const invitation = await clerk.invitations.create({
      emailAddress: validatedData.email,
      publicMetadata: {
        organizationId: organization.id,
        role: validatedData.role,
        name: validatedData.name,
      },
    });

    await prisma.user.create({
      data: {
        clerkId: `invitation_${invitation.id}`,
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        organizationId: organization.id,
      },
    });

    revalidatePath("/usuarios");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao criar usuário");
  }
}

