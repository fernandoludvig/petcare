"use client";

import { useState, useEffect } from "react";
import { PetWithClient } from "@/types";

export function usePets(search?: string) {
  const [data, setData] = useState<PetWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);

        const res = await fetch(`/api/pets?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Erro ao buscar pets");
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

export async function createPet(data: any) {
  const res = await fetch("/api/pets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao criar pet");
  }
  return res.json();
}

export async function updatePet(id: string, data: any) {
  const res = await fetch(`/api/pets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao atualizar pet");
  }
  return res.json();
}

