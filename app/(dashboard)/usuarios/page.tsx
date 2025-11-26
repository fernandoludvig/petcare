import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization, getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Plus } from "lucide-react";
import { UsersList } from "@/components/users/users-list";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

async function UsersContent() {
  try {
    const organization = await getCurrentOrganization();
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      notFound();
    }

    const users = await prisma.user.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    return <UsersList users={users} currentUserId={currentUser.id} />;
  } catch (error: any) {
    console.error("Error loading users:", error);
    return <div className="text-center py-12 text-red-600">Erro: {error.message}</div>;
  }
}

export default async function UsersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários e colaboradores do sistema</p>
        </div>
        <Link href="/usuarios/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="text-center py-12">Carregando usuários...</div>}>
        <UsersContent />
      </Suspense>
    </div>
  );
}

