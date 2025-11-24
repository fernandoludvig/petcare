import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PetCard } from "@/components/pets/pet-card";

async function PetsContent({ search }: { search?: string }) {
  try {
    const organization = await getCurrentOrganization();

    const pets = await prisma.pet.findMany({
      where: {
        organizationId: organization.id,
      },
      select: {
        id: true,
        name: true,
        species: true,
        size: true,
        photoUrl: true,
        medicalNotes: true,
        clientId: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    if (pets.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">Nenhum pet encontrado</p>
        </div>
      );
    }

    const clientIds = [...new Set(pets.map((p) => p.clientId))];
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const clientMap = new Map(clients.map((c) => [c.id, c]));

    let petsWithClients = pets.map((pet) => ({
      ...pet,
      client: clientMap.get(pet.clientId) || { id: pet.clientId, name: "Cliente não encontrado" },
    }));

    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      petsWithClients = petsWithClients.filter((pet) => {
        return pet.name.toLowerCase().includes(searchLower) || 
               pet.client.name.toLowerCase().includes(searchLower);
      });
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {petsWithClients.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
        {petsWithClients.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Nenhum pet encontrado</p>
          </div>
        )}
      </div>
    );
  } catch (error: any) {
    console.error("Error loading pets:", error);
    return <div className="text-center py-12 text-red-600">Erro: {error.message}</div>;
  }
}

export default async function PetsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pets</h1>
          <p className="text-muted-foreground">Gerencie os pets cadastrados</p>
        </div>
        <Link href="/pets/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Pet
          </Button>
        </Link>
      </div>

      <form action="/pets" method="get" className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="search" placeholder="Buscar por nome do pet ou dono..." className="pl-10" defaultValue={params.search} />
      </form>

      <Suspense fallback={<div className="text-center py-12">Carregando pets...</div>}>
        <PetsContent search={params.search} />
      </Suspense>
    </div>
  );
}
