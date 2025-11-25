import { Suspense } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentAppointments } from "@/components/dashboard/recent-appointments";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { format, startOfDay, endOfDay, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentWithRelations } from "@/types";

export const dynamic = 'force-dynamic';

type SerializedAppointment = Omit<AppointmentWithRelations, 'startTime' | 'endTime' | 'createdAt' | 'updatedAt' | 'reminderSentAt'> & {
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  reminderSentAt: string | null;
  pet: Omit<AppointmentWithRelations['pet'], 'birthDate' | 'createdAt' | 'updatedAt'> & {
    birthDate: string | null;
    createdAt: string;
    updatedAt: string;
    client: Omit<AppointmentWithRelations['pet']['client'], 'createdAt' | 'updatedAt'> & {
      createdAt: string;
      updatedAt: string;
    };
  };
  client: Omit<AppointmentWithRelations['client'], 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  };
  service: Omit<AppointmentWithRelations['service'], 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  };
  assignedTo: AppointmentWithRelations['assignedTo'] extends null ? null : Omit<NonNullable<AppointmentWithRelations['assignedTo']>, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  };
};

async function getDashboardData() {
  const organization = await getCurrentOrganization();
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const todayAppointments = await prisma.appointment.findMany({
    where: {
      organizationId: organization.id,
      startTime: {
        gte: todayStart,
        lte: todayEnd,
      },
      status: {
        notIn: ["CANCELLED"],
      },
    },
    include: {
      pet: {
        include: {
          client: true,
        },
      },
      client: true,
      service: true,
      assignedTo: true,
    },
  });

  const todayRevenue = todayAppointments
    .filter((apt) => apt.paid)
    .reduce((sum, apt) => sum + apt.price, 0);

  const todayPets = new Set(todayAppointments.map((apt) => apt.petId)).size;

  const nextTwoHours = new Date();
  nextTwoHours.setHours(nextTwoHours.getHours() + 2);

  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      organizationId: organization.id,
      startTime: {
        gte: today,
        lte: nextTwoHours,
      },
      status: {
        in: ["SCHEDULED", "CONFIRMED"],
      },
    },
    include: {
      pet: {
        include: {
          client: true,
        },
      },
      client: true,
      service: true,
      assignedTo: true,
    },
    orderBy: {
      startTime: "asc",
    },
    take: 5,
  });

  const pendingAppointments = await prisma.appointment.findMany({
    where: {
      organizationId: organization.id,
      status: "SCHEDULED",
      startTime: {
        gte: today,
      },
    },
    include: {
      pet: {
        include: {
          client: true,
        },
      },
      client: true,
      service: true,
      assignedTo: true,
    },
    orderBy: {
      startTime: "asc",
    },
    take: 5,
  });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    return {
      date: format(date, "yyyy-MM-dd"),
      revenue: 0,
    };
  });

  const revenueData = await prisma.appointment.findMany({
    where: {
      organizationId: organization.id,
      startTime: {
        gte: startOfDay(subDays(today, 6)),
        lte: endOfDay(today),
      },
      paid: true,
    },
    select: {
      startTime: true,
      price: true,
    },
  });

  revenueData.forEach((apt) => {
    const dateKey = format(apt.startTime, "yyyy-MM-dd");
    const dayData = last7Days.find((d) => d.date === dateKey);
    if (dayData) {
      dayData.revenue += apt.price;
    }
  });

  const monthStart = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
  const monthEnd = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));

  const monthRevenue = await prisma.appointment.aggregate({
    where: {
      organizationId: organization.id,
      startTime: {
        gte: monthStart,
        lte: monthEnd,
      },
      paid: true,
    },
    _sum: {
      price: true,
    },
  });

  const businessHours = (organization.businessHours as any) || {
    seg: "08:00-18:00",
    ter: "08:00-18:00",
    qua: "08:00-18:00",
    qui: "08:00-18:00",
    sex: "08:00-18:00",
    sab: "08:00-14:00",
    dom: "Fechado",
  };

  const todayDay = format(today, "EEE", { locale: ptBR }).toLowerCase().slice(0, 3);
  const todayHours = businessHours[todayDay] || "08:00-18:00";
  
  let occupancyRate = 0;
  if (todayHours !== "Fechado") {
    const [open, close] = todayHours.split("-").map((h: string) => {
      const [hour, minute] = h.split(":").map(Number);
      return hour * 60 + minute;
    });
    const totalMinutes = close - open;
    const bookedMinutes = todayAppointments.reduce((sum, apt) => {
      const start = new Date(apt.startTime);
      const end = new Date(apt.endTime);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60);
    }, 0);
    occupancyRate = Math.round((bookedMinutes / totalMinutes) * 100);
  }

  const serializeAppointment = (apt: any): SerializedAppointment => ({
    ...apt,
    startTime: apt.startTime.toISOString(),
    endTime: apt.endTime.toISOString(),
    createdAt: apt.createdAt.toISOString(),
    updatedAt: apt.updatedAt.toISOString(),
    reminderSentAt: apt.reminderSentAt ? apt.reminderSentAt.toISOString() : null,
    pet: {
      ...apt.pet,
      birthDate: apt.pet.birthDate ? apt.pet.birthDate.toISOString() : null,
      createdAt: apt.pet.createdAt.toISOString(),
      updatedAt: apt.pet.updatedAt.toISOString(),
      client: {
        ...apt.pet.client,
        createdAt: apt.pet.client.createdAt.toISOString(),
        updatedAt: apt.pet.client.updatedAt.toISOString(),
      },
    },
    client: {
      ...apt.client,
      createdAt: apt.client.createdAt.toISOString(),
      updatedAt: apt.client.updatedAt.toISOString(),
    },
    service: {
      ...apt.service,
      createdAt: apt.service.createdAt.toISOString(),
      updatedAt: apt.service.updatedAt.toISOString(),
    },
    assignedTo: apt.assignedTo ? {
      ...apt.assignedTo,
      createdAt: apt.assignedTo.createdAt.toISOString(),
      updatedAt: apt.assignedTo.updatedAt.toISOString(),
    } : null,
  });

  return {
    todayAppointments: todayAppointments.length,
    todayRevenue,
    todayPets,
    occupancyRate,
    monthRevenue: monthRevenue._sum.price || 0,
    upcomingAppointments: upcomingAppointments.map(serializeAppointment) as any,
    pendingAppointments: pendingAppointments.map(serializeAppointment) as any,
    revenueData: last7Days,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu pet shop
        </p>
      </div>

      <StatsCards
        todayAppointments={data.todayAppointments}
        todayRevenue={data.todayRevenue}
        todayPets={data.todayPets}
        occupancyRate={data.occupancyRate}
        monthRevenue={data.monthRevenue}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Carregando gráfico...</div>}>
          <RevenueChart data={data.revenueData} />
        </Suspense>
        <Suspense fallback={<div>Carregando agendamentos...</div>}>
          <UpcomingAppointments appointments={data.pendingAppointments} />
        </Suspense>
      </div>

      <Suspense fallback={<div>Carregando próximos agendamentos...</div>}>
        <RecentAppointments appointments={data.upcomingAppointments} />
      </Suspense>
    </div>
  );
}

