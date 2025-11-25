import { Suspense } from "react";
import { HistoryList } from "@/components/appointments/history-list";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";

export const dynamic = 'force-dynamic';

async function HistoryContent({
  searchParams,
}: {
  searchParams: Promise<{
    clientId?: string;
    petId?: string;
    serviceId?: string;
    assignedToId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  try {
    const organization = await getCurrentOrganization();
    const params = await searchParams;

    const where: any = {
      organizationId: organization.id,
      status: "COMPLETED",
    };

    if (params.clientId) {
      where.clientId = params.clientId;
    }

    if (params.petId) {
      where.petId = params.petId;
    }

    if (params.serviceId) {
      where.serviceId = params.serviceId;
    }

    if (params.assignedToId) {
      where.assignedToId = params.assignedToId;
    }

    if (params.startDate || params.endDate) {
      where.startTime = {};
      if (params.startDate) {
        where.startTime.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        const endDate = new Date(params.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.startTime.lte = endDate;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        pet: { include: { client: true } },
        client: true,
        service: true,
        assignedTo: true,
      },
      orderBy: { startTime: "desc" },
      take: 500,
    });

    const clients = await prisma.client.findMany({
      where: { organizationId: organization.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    const pets = await prisma.pet.findMany({
      where: { organizationId: organization.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, clientId: true },
    });

    const services = await prisma.service.findMany({
      where: { organizationId: organization.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    const users = await prisma.user.findMany({
      where: { organizationId: organization.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    return (
      <HistoryList
        appointments={appointments}
        clients={clients}
        pets={pets}
        services={services}
        users={users}
        filters={params}
      />
    );
  } catch (error: any) {
    console.error("Error loading history:", error);
    return <div className="text-center py-12 text-red-600">Erro: {error.message}</div>;
  }
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    clientId?: string;
    petId?: string;
    serviceId?: string;
    assignedToId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico</h1>
        <p className="text-muted-foreground">Agendamentos finalizados</p>
      </div>

      <Suspense fallback={<div className="text-center py-12">Carregando histórico...</div>}>
        <HistoryContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

