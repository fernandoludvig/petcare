"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, X, Pencil } from "lucide-react";
import { AppointmentWithRelations } from "@/types";
import Link from "next/link";

interface HistoryListProps {
  appointments: AppointmentWithRelations[];
  clients: Array<{ id: string; name: string }>;
  pets: Array<{ id: string; name: string; clientId: string }>;
  services: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string }>;
  filters: {
    clientId?: string;
    petId?: string;
    serviceId?: string;
    assignedToId?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function HistoryList({
  appointments,
  clients,
  pets,
  services,
  users,
  filters,
}: HistoryListProps) {
  const router = useRouter();
  const [clientId, setClientId] = useState(filters.clientId || undefined);
  const [petId, setPetId] = useState(filters.petId || undefined);
  const [serviceId, setServiceId] = useState(filters.serviceId || undefined);
  const [assignedToId, setAssignedToId] = useState(filters.assignedToId || undefined);
  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (clientId && clientId !== "__none__") params.set("clientId", clientId);
    if (petId && petId !== "__none__") params.set("petId", petId);
    if (serviceId && serviceId !== "__none__") params.set("serviceId", serviceId);
    if (assignedToId && assignedToId !== "__none__") params.set("assignedToId", assignedToId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    router.push(`/agendamentos/historico?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setClientId(undefined);
    setPetId(undefined);
    setServiceId(undefined);
    setAssignedToId(undefined);
    setStartDate("");
    setEndDate("");
    router.push("/agendamentos/historico");
  };

  const filteredPets = clientId
    ? pets.filter((p) => p.clientId === clientId)
    : pets;

  const hasFilters =
    clientId || petId || serviceId || assignedToId || startDate || endDate;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Cliente</label>
            <Select 
              value={clientId || "__none__"} 
              onValueChange={(value) => setClientId(value === "__none__" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Todos os clientes</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Pet</label>
            <Select 
              value={petId || "__none__"} 
              onValueChange={(value) => setPetId(value === "__none__" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os pets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Todos os pets</SelectItem>
                {filteredPets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Serviço</label>
            <Select 
              value={serviceId || "__none__"} 
              onValueChange={(value) => setServiceId(value === "__none__" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os serviços" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Todos os serviços</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Colaborador</label>
            <Select 
              value={assignedToId || "__none__"} 
              onValueChange={(value) => setAssignedToId(value === "__none__" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os colaboradores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Todos os colaboradores</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Data Inicial</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Data Final</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleFilter}>
            <Search className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          {hasFilters && (
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Pet</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Colaborador</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhum agendamento encontrado
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => {
                const startTime = appointment.startTime
                  ? new Date(appointment.startTime)
                  : null;

                return (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {startTime
                        ? format(startTime, "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/clientes/${appointment.clientId}`}
                        className="text-primary hover:underline"
                      >
                        {appointment.client?.name || "-"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/pets/${appointment.petId}`}
                        className="text-primary hover:underline"
                      >
                        {appointment.pet?.name || "-"}
                      </Link>
                    </TableCell>
                    <TableCell>{appointment.service?.name || "-"}</TableCell>
                    <TableCell>
                      {appointment.assignedTo?.name || "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {appointment.price?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>
                      {appointment.paid ? (
                        <Badge className="bg-green-500">Pago</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/agendamentos/${appointment.id}/editar?returnTo=/agendamentos/historico`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {appointments.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Total de {appointments.length} agendamento(s) encontrado(s)
        </div>
      )}
    </div>
  );
}

