import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { ServiceActions } from "@/components/services/service-actions";

export const dynamic = 'force-dynamic';

async function getServices() {
  const organization = await getCurrentOrganization();

  const services = await prisma.service.findMany({
    where: {
      organizationId: organization.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return services;
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos
          </p>
        </div>
        <Link href="/servicos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Serviço
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Preços por Porte</TableHead>
              <TableHead>Duração (min)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.description || "-"}</TableCell>
                <TableCell>
                  <div className="text-xs space-y-1">
                    {service.priceMini && (
                      <div>Mini: R$ {service.priceMini.toFixed(2)}</div>
                    )}
                    {service.priceSmall && (
                      <div>Pequeno: R$ {service.priceSmall.toFixed(2)}</div>
                    )}
                    {service.priceMedium && (
                      <div>Médio: R$ {service.priceMedium.toFixed(2)}</div>
                    )}
                    {service.priceLarge && (
                      <div>Grande: R$ {service.priceLarge.toFixed(2)}</div>
                    )}
                    {service.priceGiant && (
                      <div>Gigante: R$ {service.priceGiant.toFixed(2)}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-1">
                    <div>Mini: {service.durationMini}min</div>
                    <div>Pequeno: {service.durationSmall}min</div>
                    <div>Médio: {service.durationMedium}min</div>
                    <div>Grande: {service.durationLarge}min</div>
                    <div>Gigante: {service.durationGiant}min</div>
                  </div>
                </TableCell>
                <TableCell>
                  {service.active ? (
                    <Badge className="bg-green-100 text-green-800">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline">Inativo</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <ServiceActions serviceId={service.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum serviço encontrado</p>
        </div>
      )}
    </div>
  );
}

