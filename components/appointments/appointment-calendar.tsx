"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppointmentWithRelations } from "@/types";
import { cn } from "@/lib/utils";

interface AppointmentCalendarProps {
  appointments: AppointmentWithRelations[];
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void;
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-500",
  CONFIRMED: "bg-green-500",
  IN_PROGRESS: "bg-yellow-500",
  COMPLETED: "bg-gray-500",
  CANCELLED: "bg-red-500",
  NO_SHOW: "bg-orange-500",
};

export function AppointmentCalendar({
  appointments,
  onAppointmentClick,
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date());
  }, []);

  if (!mounted || !currentDate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando calendário...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weekStart = startOfWeek(currentDate, { locale: ptBR });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    return appointments.filter((apt) => {
      if (!apt.startTime) return false;
      try {
        const aptDate = new Date(apt.startTime);
        return (
          isSameDay(aptDate, day) &&
          aptDate.getHours() === hour &&
          apt.status !== "CANCELLED" &&
          apt.status !== "COMPLETED"
        );
      } catch (error) {
        console.error("Error parsing appointment date:", error, apt);
        return false;
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentDate(addDays(currentDate, -7))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (mounted) {
                  setCurrentDate(new Date());
                }
              }}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 border-b">
              <div className="p-2 font-medium">Hora</div>
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-2 text-center font-medium",
                    currentDate && isSameDay(day, currentDate) && "bg-primary/10"
                  )}
                >
                  <div className="text-xs text-muted-foreground">
                    {format(day, "EEE", { locale: ptBR })}
                  </div>
                  <div>{format(day, "dd/MM", { locale: ptBR })}</div>
                </div>
              ))}
            </div>
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b">
                <div className="p-2 text-sm text-muted-foreground">
                  {hour}:00
                </div>
                {weekDays.map((day) => {
                  const slotAppointments = getAppointmentsForSlot(day, hour);
                  return (
                    <div
                      key={day.toISOString()}
                      className="min-h-[60px] border-l p-1"
                    >
                      {slotAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className={cn(
                            "mb-1 cursor-pointer rounded p-1 text-xs text-white",
                            statusColors[apt.status] || "bg-gray-500"
                          )}
                          onClick={() => onAppointmentClick?.(apt)}
                        >
                          <div className="font-medium">
                            {apt.pet?.name || "Pet não encontrado"}
                          </div>
                          <div className="text-xs opacity-90">
                            {apt.service?.name || "Serviço não encontrado"}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

