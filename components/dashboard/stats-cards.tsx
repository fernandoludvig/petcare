"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, PawPrint, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  todayAppointments: number;
  todayRevenue: number;
  todayPets: number;
  occupancyRate: number;
  monthRevenue: number;
}

export function StatsCards({
  todayAppointments,
  todayRevenue,
  todayPets,
  occupancyRate,
  monthRevenue,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Agendamentos Hoje",
      value: todayAppointments,
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Receita do Dia",
      value: `R$ ${todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-secondary",
    },
    {
      title: "Receita do Mês",
      value: `R$ ${monthRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Pets Atendidos",
      value: todayPets,
      icon: PawPrint,
      color: "text-accent",
    },
    {
      title: "Taxa de Ocupação",
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

