"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
interface RecentAppointmentsProps {
  appointments: any[];
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-orange-100 text-orange-800",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não Compareceu",
};

export function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento nas próximas horas
            </p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="space-y-1">
                  <div className="font-medium">
                    {appointment.pet.name} - {appointment.service.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.client.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(
                      new Date(appointment.startTime),
                      "dd/MM/yyyy 'às' HH:mm",
                      { locale: ptBR }
                    )}
                  </div>
                </div>
                <Badge
                  className={statusColors[appointment.status] || "bg-gray-100"}
                >
                  {statusLabels[appointment.status] || appointment.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

