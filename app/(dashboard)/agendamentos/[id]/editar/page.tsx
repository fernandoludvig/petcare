import { notFound, redirect } from "next/navigation";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { updateAppointment } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await getCurrentOrganization();

  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      organizationId: organization.id,
    },
    include: {
      pet: { include: { client: true } },
      client: { include: { pets: true } },
      service: true,
    },
  });

  if (!appointment) {
    notFound();
  }

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

  async function handleSubmit(data: any) {
    "use server";
    await updateAppointment(id, data);
    redirect("/agendamentos");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/agendamentos">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Agendamento</h1>
          <p className="text-muted-foreground">
            Edite as informações do agendamento
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentForm
            clients={clients}
            services={services}
            users={users}
            onSubmit={handleSubmit}
            defaultValues={{
              petId: appointment.petId,
              clientId: appointment.clientId,
              serviceId: appointment.serviceId,
              startTime: format(new Date(appointment.startTime), "yyyy-MM-dd'T'HH:mm"),
              assignedToId: appointment.assignedToId || "",
              notes: appointment.notes || "",
              price: appointment.price,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

