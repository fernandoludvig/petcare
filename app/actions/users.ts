"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization, getCurrentUser } from "@/lib/auth";
import { userSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";

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

    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

    if (!CLERK_SECRET_KEY) {
      throw new Error("CLERK_SECRET_KEY não configurado");
    }

    const response = await fetch("https://api.clerk.com/v1/invitations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: validatedData.email,
        public_metadata: {
          organizationId: organization.id,
          role: validatedData.role,
          name: validatedData.name,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao criar convite no Clerk");
    }

    const invitation = await response.json();

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

