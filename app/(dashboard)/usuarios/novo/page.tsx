import { redirect } from "next/navigation";
import { UserForm } from "@/components/users/user-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUser } from "@/app/actions/users";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function NewUserPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    notFound();
  }

  async function handleSubmit(data: any) {
    "use server";
    try {
      await createUser(data);
      redirect("/usuarios");
    } catch (error: any) {
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Usuário</h1>
        <p className="text-muted-foreground">
          Crie um novo usuário e envie o convite por email
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}

