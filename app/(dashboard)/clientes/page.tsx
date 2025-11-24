import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { prisma, withRetry } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { formatPhone } from "@/lib/utils";
import { ClientWithPets } from "@/types";

async function getClients(search?: string) {
  const organization = await getCurrentOrganization();

  const where: any = {
    organizationId: organization.id,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const clients = await withRetry(async () => {
    return await prisma.client.findMany({
      where,
      include: {
        Pet: true,
        _count: {
          select: {
            Appointment: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
  });

  // Serialize clients to match the expected type
  return clients.map((client: any) => ({
    ...client,
    pets: client.Pet || [],
    Pet: undefined, // Remover para evitar confusão
    _count: client._count ? {
      appointments: client._count.Appointment || 0,
    } : { appointments: 0 },
  })) as ClientWithPets[];
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  try {
    const params = await searchParams;
    const clientsData = await getClients(params.search);
    
    // Garantir que os dados estão serializáveis
    const clients = clientsData.map((client: any) => ({
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      organizationId: client.organizationId,
      createdAt: client.createdAt instanceof Date ? client.createdAt.toISOString() : client.createdAt,
      updatedAt: client.updatedAt instanceof Date ? client.updatedAt.toISOString() : client.updatedAt,
      pets: (client.pets || []).map((pet: any) => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        size: pet.size,
      })),
      _count: {
        appointments: client._count?.appointments || 0,
      },
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes cadastrados
          </p>
        </div>
        <Link href="/clientes/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            className="pl-10"
            defaultValue={params.search}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Pets</TableHead>
              <TableHead>Atendimentos</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Link
                    href={`/clientes/${client.id}`}
                    className="font-medium hover:underline"
                  >
                    {client.name}
                  </Link>
                </TableCell>
                <TableCell>{formatPhone(client.phone)}</TableCell>
                <TableCell>{client.email || "-"}</TableCell>
                <TableCell>{client.pets.length}</TableCell>
                <TableCell>
                  {client._count?.appointments || 0}
                </TableCell>
                <TableCell>
                  {(client._count?.appointments || 0) > 5 ? (
                    <Badge className="bg-accent">VIP</Badge>
                  ) : (
                    <Badge variant="outline">Regular</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum cliente encontrado</p>
        </div>
      )}
    </div>
  );
  } catch (error: any) {
    console.error("Error loading clients page:", error);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Erro ao carregar clientes: {error.message}
          </p>
        </div>
      </div>
    );
  }
}

