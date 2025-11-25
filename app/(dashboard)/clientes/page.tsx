import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { formatPhone } from "@/lib/utils";

export const dynamic = 'force-dynamic';

async function ClientsContent({ search }: { search?: string }) {
  try {
    const organization = await getCurrentOrganization();

    const where: any = { organizationId: organization.id };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        pets: {
          select: {
            id: true,
          },
        },
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return (
      <>
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
                    <Link href={`/clientes/${client.id}`} className="font-medium hover:underline">
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell>{formatPhone(client.phone)}</TableCell>
                  <TableCell>{client.email || "-"}</TableCell>
                  <TableCell>{client.pets.length}</TableCell>
                  <TableCell>{client._count.appointments}</TableCell>
                  <TableCell>
                    {client._count.appointments > 5 ? (
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
      </>
    );
  } catch (error: any) {
    console.error("Error loading clients:", error);
    return <div className="text-center py-12 text-red-600">Erro: {error.message}</div>;
  }
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie os clientes cadastrados</p>
        </div>
        <Link href="/clientes/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <form action="/clientes" method="get" className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="search" placeholder="Buscar por nome, telefone ou email..." className="pl-10" defaultValue={params.search} />
      </form>

      <Suspense fallback={<div className="text-center py-12">Carregando clientes...</div>}>
        <ClientsContent search={params.search} />
      </Suspense>
    </div>
  );
}
