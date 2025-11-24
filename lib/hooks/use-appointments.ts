"use client";

import { useState, useEffect } from "react";
import { AppointmentWithRelations } from "@/types";

export function useAppointments(startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append("startDate", startDate.toISOString());
        if (endDate) queryParams.append("endDate", endDate.toISOString());

        const res = await fetch(`/api/appointments?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Erro ao buscar agendamentos");
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return { data, loading, error, refetch: () => {} };
}

export async function createAppointment(data: any) {
  const res = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao criar agendamento");
  }
  return res.json();
}

export async function updateAppointment(id: string, data: any) {
  const res = await fetch(`/api/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao atualizar agendamento");
  }
  return res.json();
}

export async function deleteAppointment(id: string) {
  const res = await fetch(`/api/appointments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao deletar agendamento");
  }
  return res.json();
}

