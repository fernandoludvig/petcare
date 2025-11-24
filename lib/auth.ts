import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getCurrentOrganization() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Não autenticado");
  }

  const user = await currentUser();
  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  let organization = await prisma.organization.findFirst({
    where: {
      User: {
        some: {
          clerkId: userId,
        },
      },
    },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.emailAddresses[0]?.emailAddress || "Nova Organização",
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
      },
    });

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
  }

  return organization;
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

