import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { prisma, withRetry } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PetWithClient } from "@/types";

async function getPets(search?: string) {
  const organization = await getCurrentOrganization();

  const where: any = {
    organizationId: organization.id,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      {
        Client: {
          name: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  const pets = await withRetry(async () => {
    return await prisma.pet.findMany({
      where,
      include: {
        Client: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
  });

  // Serialize pets to match the expected type
  return pets.map((pet: any) => {
    if (!pet.Client) {
      console.warn(`Pet ${pet.id} não tem cliente associado`);
      // Criar um cliente vazio para evitar erros
      return {
        ...pet,
        client: {
          id: "",
          name: "Cliente não encontrado",
          phone: "",
          email: null,
        },
        Client: undefined,
      };
    }
    return {
      ...pet,
      client: pet.Client,
      Client: undefined, // Remover para evitar confusão
    };
  }) as PetWithClient[];
}

const speciesLabels: Record<string, string> = {
  DOG: "Cachorro",
  CAT: "Gato",
  OTHER: "Outro",
};

const sizeLabels: Record<string, string> = {
  MINI: "Mini",
  SMALL: "Pequeno",
  MEDIUM: "Médio",
  LARGE: "Grande",
  GIANT: "Gigante",
};

export default async function PetsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  try {
    const params = await searchParams;
    const petsData = await getPets(params.search);
    
    // Garantir que os dados estão serializáveis
    const pets = petsData.map((pet: any) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      size: pet.size,
      weight: pet.weight,
      birthDate: pet.birthDate ? (pet.birthDate instanceof Date ? pet.birthDate.toISOString() : pet.birthDate) : null,
      color: pet.color,
      gender: pet.gender,
      medicalNotes: pet.medicalNotes,
      behaviorNotes: pet.behaviorNotes,
      photoUrl: pet.photoUrl,
      clientId: pet.clientId,
      organizationId: pet.organizationId,
      createdAt: pet.createdAt instanceof Date ? pet.createdAt.toISOString() : pet.createdAt,
      updatedAt: pet.updatedAt instanceof Date ? pet.updatedAt.toISOString() : pet.updatedAt,
      client: pet.client ? {
        id: pet.client.id,
        name: pet.client.name,
        phone: pet.client.phone,
        email: pet.client.email,
      } : null,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pets</h1>
          <p className="text-muted-foreground">
            Gerencie os pets cadastrados
          </p>
        </div>
        <Link href="/pets/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Pet
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do pet ou dono..."
            className="pl-10"
            defaultValue={params.search}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet) => (
          <Link key={pet.id} href={`/pets/${pet.id}`}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={pet.photoUrl || undefined} />
                    <AvatarFallback>
                      {pet.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pet.client.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {speciesLabels[pet.species]}
                      </Badge>
                      <Badge variant="outline">{sizeLabels[pet.size]}</Badge>
                    </div>
                    {pet.medicalNotes && (
                      <p className="text-xs text-red-600">
                        ⚠️ Observações médicas
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {pets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum pet encontrado</p>
        </div>
      )}
    </div>
  );
  } catch (error: any) {
    console.error("Error loading pets page:", error);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pets</h1>
          <p className="text-muted-foreground">
            Erro ao carregar pets: {error.message}
          </p>
        </div>
      </div>
    );
  }
}

