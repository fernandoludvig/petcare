"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization, getCurrentUser } from "@/lib/auth";
import { userSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";

export async function createUser(data: any) {
  try {
    console.log("createUser called with data:", JSON.stringify(data, null, 2));
    
    const currentUser = await getCurrentUser();
    console.log("Current user:", currentUser?.id, currentUser?.role);

    if (!currentUser) {
      console.error("No current user found");
      throw new Error("Usuário não autenticado");
    }

    if (currentUser.role !== "ADMIN") {
      console.error("User is not admin:", currentUser.role);
      throw new Error("Apenas administradores podem criar usuários");
    }

    let organization;
    try {
      organization = await getCurrentOrganization();
      console.log("Organization:", organization?.id);
    } catch (orgError: any) {
      console.error("Error getting organization:", orgError);
      throw new Error("Erro ao obter organização. Por favor, tente novamente.");
    }

    if (!organization || !organization.id) {
      console.error("No organization found or invalid organization");
      throw new Error("Organização não encontrada. Por favor, faça login novamente.");
    }

    let validatedData;
    try {
      validatedData = userSchema.parse(data);
      console.log("Validated data:", validatedData);
    } catch (validationError: any) {
      console.error("Validation error:", validationError);
      if (validationError.errors && validationError.errors.length > 0) {
        const firstError = validationError.errors[0];
        throw new Error(firstError.message || "Dados inválidos");
      }
      throw new Error("Dados inválidos");
    }

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
      console.error("CLERK_SECRET_KEY not configured");
      throw new Error("Configuração do sistema incompleta. Entre em contato com o suporte.");
    }

    const redirectUrl = `${APP_URL}${NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}`;
    console.log("Redirect URL:", redirectUrl);

    const invitationData = {
      email_address: validatedData.email,
      public_metadata: {
        organizationId: organization.id,
        role: validatedData.role,
        name: validatedData.name,
      },
      redirect_url: redirectUrl,
    };
    
    console.log("Invitation data:", JSON.stringify(invitationData, null, 2));

    let response;
    try {
      response = await fetch("https://api.clerk.com/v1/invitations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invitationData),
      });
    } catch (fetchError: any) {
      console.error("Error fetching Clerk API:", fetchError);
      throw new Error("Erro de conexão com o serviço de autenticação. Verifique sua conexão e tente novamente.");
    }

    if (!response.ok) {
      let errorText = "";
      try {
        errorText = await response.text();
      } catch {
        errorText = "Erro desconhecido";
      }
      
      let errorMessage = "Erro ao criar convite no serviço de autenticação";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.errors?.[0]?.message || errorData.message || errorMessage;
      } catch {
        if (errorText) {
          errorMessage = errorText.length > 200 ? "Erro ao criar convite no serviço de autenticação" : errorText;
        }
      }
      
      console.error("Clerk API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        body: errorText,
      });
      
      throw new Error(errorMessage);
    }

    let invitation;
    try {
      invitation = await response.json();
      console.log("Invitation response:", JSON.stringify(invitation, null, 2));
      
      if (!invitation || !invitation.id) {
        console.error("Invalid invitation response:", invitation);
        throw new Error("Resposta inválida do serviço de autenticação");
      }
    } catch (error: any) {
      console.error("Error parsing invitation response:", error);
      throw new Error("Erro ao processar resposta do serviço de autenticação");
    }

    try {
      await prisma.user.create({
        data: {
          clerkId: `invitation_${invitation.id}`,
          email: validatedData.email,
          name: validatedData.name,
          role: validatedData.role,
          organizationId: organization.id,
        },
      });
      console.log("User created successfully in database");
    } catch (dbError: any) {
      console.error("Error creating user in database:", dbError);
      if (dbError.code === "P2002") {
        throw new Error("Já existe um usuário com este email");
      }
      throw new Error("Erro ao salvar usuário no banco de dados: " + (dbError.message || ""));
    }

    revalidatePath("/usuarios");
    revalidatePath("/usuarios/novo");
    
    console.log("User created successfully");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error creating user - Full error:", {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      errors: error.errors,
    });
    
    let errorMessage = "Erro ao criar usuário";
    
    // Se for um erro de validação do Zod, retornar mensagem mais clara
    if (error.name === "ZodError") {
      const firstError = error.errors?.[0];
      errorMessage = firstError?.message || "Dados inválidos";
      console.error("Zod validation error:", errorMessage);
    }
    // Se for um erro do Prisma, retornar mensagem mais clara
    else if (error.code === "P2002") {
      console.error("Prisma unique constraint error");
      errorMessage = "Já existe um usuário com este email";
    }
    // Outros erros
    else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error("Final error message:", errorMessage);
    return { success: false, error: errorMessage };
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

