"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
interface UpcomingAppointmentsProps {
  appointments: any[];
}

export function UpcomingAppointments({
  appointments,
}: UpcomingAppointmentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pendentes de Confirmação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento pendente
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
                <Badge variant="outline">Aguardando</Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

