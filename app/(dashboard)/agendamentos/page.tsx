import { Suspense } from "react";
import { AppointmentsCalendarWrapper } from "@/components/appointments/appointments-calendar-wrapper";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { startOfWeek, endOfWeek } from "date-fns";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

async function AppointmentsContent() {
  try {
    const organization = await getCurrentOrganization();
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());

    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId: organization.id,
        startTime: { gte: weekStart, lte: weekEnd },
      },
      include: {
        pet: { include: { client: true } },
        client: true,
        service: true,
        assignedTo: true,
      },
      orderBy: { startTime: "asc" },
      take: 200,
    });

    return <AppointmentsCalendarWrapper appointments={appointments} />;
  } catch (error: any) {
    console.error("Error loading appointments:", error);
    return <div className="text-center py-12 text-red-600">Erro: {error.message}</div>;
  }
}

export default async function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos do seu pet shop</p>
        </div>
        <Link href="/agendamentos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="text-center py-12">Carregando calendário...</div>}>
        <AppointmentsContent />
      </Suspense>
    </div>
  );
}
