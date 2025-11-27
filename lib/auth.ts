import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getCurrentOrganization() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Não autenticado");
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { organizationId: true },
    });

    if (dbUser) {
      const organization = await prisma.organization.findUnique({
        where: { id: dbUser.organizationId },
      });
      if (organization) {
        return organization;
      }
    }
  } catch (error: any) {
    console.error("Error fetching user from database:", error);
  }

  const user = await currentUser();
  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  try {
    let organization = await prisma.organization.findFirst({
      where: {
        users: {
          some: {
            clerkId: userId,
          },
        },
      },
    });

    if (!organization) {
      organization = await prisma.organization.findUnique({
        where: { clerkId: user.id },
      });

      if (!organization) {
        try {
          organization = await prisma.organization.create({
            data: {
              name: user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.emailAddresses[0]?.emailAddress || "Nova Organização",
              clerkId: user.id,
              email: user.emailAddresses[0]?.emailAddress || "",
            },
          });
        } catch (createError: any) {
          if (createError.code === "P2002") {
            organization = await prisma.organization.findUnique({
              where: { clerkId: user.id },
            });
            if (!organization) {
              throw new Error("Erro ao criar organização. Tente novamente.");
            }
          } else {
            throw createError;
          }
        }
      }

      const existingUser = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!existingUser && organization) {
        try {
          await prisma.user.create({
            data: {
              clerkId: userId,
              email: user.emailAddresses[0]?.emailAddress || "",
              name: user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.emailAddresses[0]?.emailAddress || "Usuário",
              organizationId: organization.id,
            },
          });
        } catch (userError: any) {
          if (userError.code !== "P2002") {
            console.error("Error creating user:", userError);
          }
        }
      }
    }

    if (!organization) {
      throw new Error("Organização não encontrada");
    }

    return organization;
  } catch (error: any) {
    console.error("Error in getCurrentOrganization:", error);
    if (error.message?.includes("Can't reach database server")) {
      throw new Error("Erro de conexão com o banco de dados. Tente novamente em alguns instantes.");
    }
    throw error;
  }
}

export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Não autenticado");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });

  return user;
}

