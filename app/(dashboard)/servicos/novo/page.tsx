import { redirect } from "next/navigation";
import { ServiceForm } from "@/components/services/service-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createService } from "@/app/actions/services";

export default async function NewServicePage() {
  async function handleSubmit(data: any) {
    "use server";
    await createService(data);
    redirect("/servicos");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Serviço</h1>
        <p className="text-muted-foreground">
          Crie um novo serviço para o seu pet shop
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}



