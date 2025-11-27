import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization, getCurrentUser } from "@/lib/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

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

const genderLabels: Record<string, string> = {
  MALE: "Macho",
  FEMALE: "Fêmea",
};

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await getCurrentOrganization();
  const currentUser = await getCurrentUser();

  const appointmentWhere: any = {
    petId: id,
  };

  if (currentUser && currentUser.role !== "ADMIN") {
    appointmentWhere.assignedToId = currentUser.id;
  }

  const pet = await prisma.pet.findFirst({
    where: {
      id,
      organizationId: organization.id,
    },
    include: {
      client: true,
      appointments: {
        where: appointmentWhere,
        include: {
          service: true,
        },
        orderBy: {
          startTime: "desc",
        },
        take: 10,
      },
    },
  });

  if (!pet) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pets">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{pet.name}</h1>
          <p className="text-muted-foreground">
            Detalhes e histórico do pet
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Pet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={pet.photoUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  {pet.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <p>{pet.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Dono</label>
                <p>{pet.client.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Espécie</label>
                <p>{speciesLabels[pet.species]}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Raça</label>
                <p>{pet.breed || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Porte</label>
                <Badge>{sizeLabels[pet.size]}</Badge>
              </div>
              {pet.weight && (
                <div>
                  <label className="text-sm font-medium">Peso</label>
                  <p>{pet.weight} kg</p>
                </div>
              )}
              {pet.birthDate && (
                <div>
                  <label className="text-sm font-medium">Data de Nascimento</label>
                  <p>
                    {format(new Date(pet.birthDate), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              )}
              {pet.gender && (
                <div>
                  <label className="text-sm font-medium">Sexo</label>
                  <p>{genderLabels[pet.gender]}</p>
                </div>
              )}
              {pet.color && (
                <div>
                  <label className="text-sm font-medium">Cor</label>
                  <p>{pet.color}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pet.medicalNotes && (
              <div>
                <label className="text-sm font-medium text-red-600">
                  Observações Médicas
                </label>
                <p className="text-sm">{pet.medicalNotes}</p>
              </div>
            )}
            {pet.behaviorNotes && (
              <div>
                <label className="text-sm font-medium">
                  Observações de Comportamento
                </label>
                <p className="text-sm">{pet.behaviorNotes}</p>
              </div>
            )}
            {!pet.medicalNotes && !pet.behaviorNotes && (
              <p className="text-sm text-muted-foreground">
                Nenhuma observação registrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {pet.appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento registrado
            </p>
          ) : (
            <div className="space-y-4">
              {pet.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{appointment.service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(appointment.startTime),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {appointment.price.toFixed(2)}</p>
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

