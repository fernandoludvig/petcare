import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { formatPhone } from "@/lib/utils";
import { format as formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await getCurrentOrganization();

  const client = await prisma.client.findFirst({
    where: {
      id,
      organizationId: organization.id,
    },
    include: {
      Pet: true,
      Appointment: {
        include: {
          Pet: true,
          Service: true,
        },
        orderBy: {
          startTime: "desc",
        },
        take: 10,
      },
    },
  });

  if (!client) {
    notFound();
  }

  const appointmentCount = await prisma.appointment.count({
    where: {
      clientId: client.id,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{client.name}</h1>
            {appointmentCount > 5 && (
              <Badge className="bg-accent">VIP</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Detalhes e histórico do cliente
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <p>{client.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Telefone</label>
              <p>{formatPhone(client.phone)}</p>
            </div>
            {client.email && (
              <div>
                <label className="text-sm font-medium">Email</label>
                <p>{client.email}</p>
              </div>
            )}
            {client.cpf && (
              <div>
                <label className="text-sm font-medium">CPF</label>
                <p>{client.cpf}</p>
              </div>
            )}
            {client.address && (
              <div>
                <label className="text-sm font-medium">Endereço</label>
                <p>{client.address}</p>
              </div>
            )}
            {client.notes && (
              <div>
                <label className="text-sm font-medium">Observações</label>
                <p className="text-sm">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pets</CardTitle>
          </CardHeader>
          <CardContent>
            {client.Pet.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum pet cadastrado
              </p>
            ) : (
              <div className="space-y-2">
                {client.Pet.map((pet) => (
                  <Link
                    key={pet.id}
                    href={`/pets/${pet.id}`}
                    className="block p-2 rounded hover:bg-accent"
                  >
                    <p className="font-medium">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pet.breed || "Sem raça definida"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {client.Appointment.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento registrado
            </p>
          ) : (
            <div className="space-y-4">
              {client.Appointment.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {appointment.Pet.name} - {appointment.Service.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(
                        new Date(appointment.startTime),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      R$ {appointment.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.paid ? "Pago" : "Pendente"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

