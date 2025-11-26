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
        redirect_url: redirectUrl,
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

