import { notFound, redirect } from "next/navigation";
import { UserForm } from "@/components/users/user-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization, getCurrentUser } from "@/lib/auth";
import { updateUser } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await getCurrentOrganization();
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    notFound();
  }

  const user = await prisma.user.findFirst({
    where: {
      id,
      organizationId: organization.id,
    },
  });

  if (!user) {
    notFound();
  }

  async function handleSubmit(data: any) {
    "use server";
    await updateUser(id, data);
    redirect("/usuarios");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/usuarios">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Usuário</h1>
          <p className="text-muted-foreground">
            Edite as informações do usuário
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            onSubmit={handleSubmit}
            defaultValues={{
              name: user.name,
              email: user.email,
              role: user.role,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

