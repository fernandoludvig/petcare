import { redirect } from "next/navigation";
import { PetForm } from "@/components/pets/pet-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { createPet } from "@/app/actions/pets";

async function getClients() {
  const organization = await getCurrentOrganization();

  const clients = await prisma.client.findMany({
    where: {
      organizationId: organization.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return clients;
}

export default async function NewPetPage() {
  const clients = await getClients();

  async function handleSubmit(data: any) {
    "use server";
    await createPet(data);
    redirect("/pets");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Pet</h1>
        <p className="text-muted-foreground">
          Cadastre um novo pet no sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Pet</CardTitle>
        </CardHeader>
        <CardContent>
          <PetForm clients={clients} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}

