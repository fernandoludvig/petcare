"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema } from "@/lib/validations/service";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface ServiceFormProps {
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: any;
}

export function ServiceForm({ onSubmit, defaultValues }: ServiceFormProps) {
  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      priceMini: "",
      priceSmall: "",
      priceMedium: "",
      priceLarge: "",
      priceGiant: "",
      durationMini: 30,
      durationSmall: 45,
      durationMedium: 60,
      durationLarge: 90,
      durationGiant: 120,
      active: true,
    },
  });

  const handleSubmit = async (data: any) => {
    const processedData = {
      ...data,
      priceMini: data.priceMini ? parseFloat(data.priceMini) : undefined,
      priceSmall: data.priceSmall ? parseFloat(data.priceSmall) : undefined,
      priceMedium: data.priceMedium ? parseFloat(data.priceMedium) : undefined,
      priceLarge: data.priceLarge ? parseFloat(data.priceLarge) : undefined,
      priceGiant: data.priceGiant ? parseFloat(data.priceGiant) : undefined,
      durationMini: parseInt(data.durationMini) || 30,
      durationSmall: parseInt(data.durationSmall) || 45,
      durationMedium: parseInt(data.durationMedium) || 60,
      durationLarge: parseInt(data.durationLarge) || 90,
      durationGiant: parseInt(data.durationGiant) || 120,
    };
    await onSubmit(processedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Serviço</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Banho, Tosa..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Descrição do serviço (opcional)" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold">Preços por Porte</h3>
            <FormField
              control={form.control}
              name="priceMini"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Mini</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ""}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priceSmall"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Pequeno</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ""}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priceMedium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Médio</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ""}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priceLarge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Grande</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ""}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priceGiant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Gigante</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ""}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Duração por Porte (minutos)</h3>
            <FormField
              control={form.control}
              name="durationMini"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração Mini</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || 30}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durationSmall"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração Pequeno</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || 45}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 45)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durationMedium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração Médio</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || 60}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durationLarge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração Grande</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || 90}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 90)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durationGiant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração Gigante</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || 120}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 120)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Serviço Ativo</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Serviços inativos não aparecerão nos agendamentos
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Salvar Serviço
        </Button>
      </form>
    </Form>
  );
}




