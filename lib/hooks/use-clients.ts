"use client";

import { useState, useEffect } from "react";
import { ClientWithPets } from "@/types";

export function useClients(search?: string) {
  const [data, setData] = useState<ClientWithPets[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);

        const res = await fetch(`/api/clients?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Erro ao buscar clientes");
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search]);

  return { data, loading, error, refetch: () => {} };
}

export async function createClient(data: any) {
  const res = await fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao criar cliente");
  }
  return res.json();
}

export async function updateClient(id: string, data: any) {
  const res = await fetch(`/api/clients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao atualizar cliente");
  }
  return res.json();
}

