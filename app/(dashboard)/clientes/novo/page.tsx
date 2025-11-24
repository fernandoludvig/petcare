import { redirect } from "next/navigation";
import { ClientForm } from "@/components/clients/client-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/app/actions/clients";

export default async function NewClientPage() {
  async function handleSubmit(data: any) {
    "use server";
    await createClient(data);
    redirect("/clientes");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Cliente</h1>
        <p className="text-muted-foreground">
          Cadastre um novo cliente no sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}

