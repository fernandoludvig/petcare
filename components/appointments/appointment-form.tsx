"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema, updateAppointmentSchema } from "@/lib/validations/appointment";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Client, Pet, Service, User } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";

interface AppointmentFormProps {
  clients: (Client & { pets: Pet[] })[];
  services: Service[];
  users?: User[];
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: any;
  showStatusAndPayment?: boolean;
}

export function AppointmentForm({
  clients,
  services,
  users,
  onSubmit,
  defaultValues,
  showStatusAndPayment = false,
}: AppointmentFormProps) {
  const form = useForm({
    resolver: zodResolver(showStatusAndPayment ? updateAppointmentSchema : appointmentSchema),
    defaultValues: defaultValues || {
      petId: "",
      clientId: "",
      serviceId: "",
      startTime: "",
      assignedToId: "",
      notes: "",
      price: 0,
      status: "SCHEDULED",
      paid: false,
      paymentMethod: "",
    },
  });

  const selectedClientId = form.watch("clientId");
  const selectedPetId = form.watch("petId");
  const selectedServiceId = form.watch("serviceId");

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedPet = selectedClient?.pets.find((p) => p.id === selectedPetId);
  const selectedService = services.find((s) => s.id === selectedServiceId);

  const handleSubmit = async (data: any) => {
    const priceMap: Record<string, number> = {
      MINI: selectedService?.priceMini || 0,
      SMALL: selectedService?.priceSmall || 0,
      MEDIUM: selectedService?.priceMedium || 0,
      LARGE: selectedService?.priceLarge || 0,
      GIANT: selectedService?.priceGiant || 0,
    };

    await onSubmit({
      ...data,
      startTime: data.startTime instanceof Date ? data.startTime : new Date(data.startTime),
      price: priceMap[selectedPet?.size || "MEDIUM"] || data.price,
      assignedToId: data.assignedToId === "__none__" || !data.assignedToId ? undefined : data.assignedToId,
      paymentMethod: data.paymentMethod === "" || !data.paymentMethod ? undefined : data.paymentMethod,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedClient && (
          <FormField
            control={form.control}
            name="petId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pet</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um pet" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedClient.pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} ({pet.size})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services
                    .filter((s) => s.active)
                    .map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedPet && selectedService && (
          <div className="rounded-lg bg-muted p-4">
            <div className="text-sm">
              <div>
                Preço estimado: R${" "}
                {selectedPet.size === "MINI"
                  ? selectedService.priceMini?.toFixed(2)
                  : selectedPet.size === "SMALL"
                  ? selectedService.priceSmall?.toFixed(2)
                  : selectedPet.size === "MEDIUM"
                  ? selectedService.priceMedium?.toFixed(2)
                  : selectedPet.size === "LARGE"
                  ? selectedService.priceLarge?.toFixed(2)
                  : selectedService.priceGiant?.toFixed(2)}
              </div>
              <div className="text-muted-foreground">
                Duração estimada:{" "}
                {selectedPet.size === "MINI"
                  ? selectedService.durationMini
                  : selectedPet.size === "SMALL"
                  ? selectedService.durationSmall
                  : selectedPet.size === "MEDIUM"
                  ? selectedService.durationMedium
                  : selectedPet.size === "LARGE"
                  ? selectedService.durationLarge
                  : selectedService.durationGiant}{" "}
                minutos
              </div>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data e Horário</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={
                    field.value
                      ? typeof field.value === "string"
                        ? field.value
                        : format(
                            new Date(field.value),
                            "yyyy-MM-dd'T'HH:mm",
                            { locale: ptBR }
                          )
                      : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {users && users.length > 0 && (
          <FormField
            control={form.control}
            name="assignedToId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colaborador</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "__none__" ? undefined : value)}
                  value={field.value || "__none__"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um colaborador (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhum</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {showStatusAndPayment && (
          <>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "SCHEDULED"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Agendado</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                      <SelectItem value="COMPLETED">Concluído</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                      <SelectItem value="NO_SHOW">Não Compareceu</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Marcar como pago</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("paid") && (
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">Dinheiro</SelectItem>
                        <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                        <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="VOUCHER">Vale</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Observações opcionais" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Salvar Agendamento
        </Button>
      </form>
    </Form>
  );
}

