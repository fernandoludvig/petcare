import { redirect } from "next/navigation";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { createAppointment } from "@/app/actions/appointments";

export const dynamic = 'force-dynamic';

async function getFormData() {
  const organization = await getCurrentOrganization();

  const clients = await prisma.client.findMany({
    where: {
      organizationId: organization.id,
    },
    include: {
      pets: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const services = await prisma.service.findMany({
    where: {
      organizationId: organization.id,
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const users = await prisma.user.findMany({
    where: {
      organizationId: organization.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return { clients, services, users };
}

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ datetime?: string }>;
}) {
  const params = await searchParams;
  const formData = await getFormData();

  async function handleSubmit(data: any) {
    "use server";
    await createAppointment(data);
    redirect("/agendamentos");
  }

  const defaultValues = params.datetime
    ? {
        startTime: params.datetime,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Agendamento</h1>
        <p className="text-muted-foreground">
          Crie um novo agendamento para um pet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentForm
            clients={formData.clients}
            services={formData.services}
            users={formData.users}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
          />
        </CardContent>
      </Card>
    </div>
  );
}

