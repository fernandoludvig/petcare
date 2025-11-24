"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppointmentCalendar } from "./appointment-calendar";
import { AppointmentDetailsDialog } from "./appointment-details-dialog";
import { AppointmentWithRelations } from "@/types";
import { format } from "date-fns";

interface AppointmentsCalendarWrapperProps {
  appointments: AppointmentWithRelations[];
}

export function AppointmentsCalendarWrapper({
  appointments,
}: AppointmentsCalendarWrapperProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleAppointmentClick = (appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleSlotClick = (date: Date, hour: number) => {
    const dateTime = format(date, "yyyy-MM-dd'T'HH:mm");
    router.push(`/agendamentos/novo?datetime=${encodeURIComponent(dateTime)}`);
  };

  return (
    <>
      <AppointmentCalendar
        appointments={appointments}
        onAppointmentClick={handleAppointmentClick}
        onSlotClick={handleSlotClick}
      />
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

