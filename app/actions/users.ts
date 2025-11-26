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
    const NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/";
    
    let APP_URL = process.env.NEXT_PUBLIC_APP_URL;
    if (!APP_URL) {
      if (process.env.VERCEL_URL) {
        APP_URL = `https://${process.env.VERCEL_URL}`;
      } else {
        APP_URL = "http://localhost:3000";
      }
    }

    if (!CLERK_SECRET_KEY) {
      throw new Error("CLERK_SECRET_KEY não configurado");
    }

    const redirectUrl = `${APP_URL}${NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}`;

    const invitationData = {
      email_address: validatedData.email,
      public_metadata: {
        organizationId: organization.id,
        role: validatedData.role,
        name: validatedData.name,
      },
      redirect_url: redirectUrl,
    };

    const response = await fetch("https://api.clerk.com/v1/invitations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invitationData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Erro ao criar convite no Clerk";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.errors?.[0]?.message || errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      console.error("Clerk API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }

    let invitation;
    try {
      invitation = await response.json();
    } catch (error) {
      console.error("Error parsing invitation response:", error);
      throw new Error("Erro ao processar resposta do Clerk");
    }

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
    console.error("Error creating user:", error);
    throw new Error(error.message || "Erro ao criar usuário");
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const organization = await getCurrentOrganization();
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new Error("Apenas administradores podem editar usuários");
    }

    const validatedData = userSchema.parse(data);

    const user = await prisma.user.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (validatedData.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new Error("Já existe um usuário com este email");
      }
    }

    await prisma.user.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
      },
    });

    revalidatePath("/usuarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user:", error);
    throw new Error(error.message || "Erro ao atualizar usuário");
  }
}

export async function deleteUser(id: string) {
  try {
    const organization = await getCurrentOrganization();
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new Error("Apenas administradores podem excluir usuários");
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (user.id === currentUser.id) {
      throw new Error("Você não pode excluir seu próprio usuário");
    }

    if (user.clerkId && !user.clerkId.startsWith("invitation_")) {
      const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
      if (CLERK_SECRET_KEY) {
        try {
          await fetch(`https://api.clerk.com/v1/users/${user.clerkId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${CLERK_SECRET_KEY}`,
            },
          });
        } catch (error) {
          console.error("Error deleting user from Clerk:", error);
        }
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/usuarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    throw new Error(error.message || "Erro ao excluir usuário");
  }
}

