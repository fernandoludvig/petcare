import { Suspense } from "react";
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { prisma, withRetry } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { startOfWeek, endOfWeek } from "date-fns";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppointmentWithRelations } from "@/types";

async function getAppointments() {
  const organization = await getCurrentOrganization();
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());

  const appointments = await withRetry(async () => {
    return await prisma.appointment.findMany({
      where: {
        organizationId: organization.id,
        startTime: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      include: {
        Pet: {
          include: {
            Client: true,
          },
        },
        Client: true,
        Service: true,
        User: true,
      },
      orderBy: {
        startTime: "asc",
      },
      take: 200,
    });
  });

  // Serialize appointments to match the expected type
  return appointments.map((apt: any) => {
    const serializeDate = (date: any) => {
      if (!date) return null;
      return date instanceof Date ? date.toISOString() : date;
    };

    return {
      ...apt,
      startTime: serializeDate(apt.startTime),
      endTime: serializeDate(apt.endTime),
      createdAt: serializeDate(apt.createdAt),
      updatedAt: serializeDate(apt.updatedAt),
      reminderSentAt: serializeDate(apt.reminderSentAt),
      pet: apt.Pet ? {
        ...apt.Pet,
        birthDate: serializeDate(apt.Pet.birthDate),
        createdAt: serializeDate(apt.Pet.createdAt),
        updatedAt: serializeDate(apt.Pet.updatedAt),
        client: apt.Pet.Client ? {
          ...apt.Pet.Client,
          createdAt: serializeDate(apt.Pet.Client.createdAt),
          updatedAt: serializeDate(apt.Pet.Client.updatedAt),
        } : null,
      } : null,
      client: apt.Client ? {
        ...apt.Client,
        createdAt: serializeDate(apt.Client.createdAt),
        updatedAt: serializeDate(apt.Client.updatedAt),
      } : null,
      service: apt.Service ? {
        ...apt.Service,
        createdAt: serializeDate(apt.Service.createdAt),
        updatedAt: serializeDate(apt.Service.updatedAt),
      } : null,
      assignedTo: apt.User ? {
        ...apt.User,
        createdAt: serializeDate(apt.User.createdAt),
        updatedAt: serializeDate(apt.User.updatedAt),
      } : null,
      // Remover propriedades maiúsculas para evitar confusão
      Pet: undefined,
      Client: undefined,
      Service: undefined,
      User: undefined,
    };
  }) as AppointmentWithRelations[];
}

async function getFormData() {
  const organization = await getCurrentOrganization();

  const clients = await prisma.client.findMany({
    where: {
      organizationId: organization.id,
    },
    include: {
      Pet: true,
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

export default async function AppointmentsPage() {
  try {
    const appointments = await getAppointments();
    const formData = await getFormData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os agendamentos do seu pet shop
          </p>
        </div>
        <Link href="/agendamentos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Carregando calendário...</div>}>
        <AppointmentCalendar appointments={appointments} />
      </Suspense>
    </div>
  );
  } catch (error: any) {
    console.error("Error loading appointments page:", error);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">
            Erro ao carregar agendamentos: {error.message}
          </p>
        </div>
      </div>
    );
  }
}

