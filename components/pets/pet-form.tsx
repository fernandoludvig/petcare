"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { petSchema } from "@/lib/validations/pet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
import { Client } from "@prisma/client";
import { format } from "date-fns";

interface PetFormProps {
  clients: Client[];
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: any;
}

export function PetForm({ clients, onSubmit, defaultValues }: PetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm({
    resolver: zodResolver(petSchema),
    defaultValues: defaultValues || {
      name: "",
      species: "DOG",
      breed: "",
      size: "MEDIUM",
      weight: "",
      birthDate: "",
      color: "",
      gender: undefined,
      medicalNotes: "",
      behaviorNotes: "",
      photoUrl: "",
      photoFile: undefined,
      clientId: undefined,
    },
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Converter peso para número se for string
      const weight = data.weight 
        ? (typeof data.weight === "string" && data.weight !== "" 
            ? parseFloat(data.weight) 
            : typeof data.weight === "number" 
            ? data.weight 
            : undefined)
        : undefined;

      // Converter data de nascimento para Date se for string
      const birthDate = data.birthDate 
        ? (typeof data.birthDate === "string" && data.birthDate !== ""
            ? new Date(data.birthDate)
            : data.birthDate instanceof Date
            ? data.birthDate
            : undefined)
        : undefined;

      // Processar upload de imagem se houver
      let photoUrl = data.photoUrl || undefined;
      if (data.photoFile && data.photoFile instanceof File) {
        // Converter arquivo para base64
        const reader = new FileReader();
        photoUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(data.photoFile);
        });
      }

      await onSubmit({
        ...data,
        weight: weight !== undefined && !isNaN(weight) ? weight : undefined,
        birthDate,
        photoUrl,
        photoFile: undefined, // Não enviar o arquivo, apenas a URL
        gender: data.gender === "" ? undefined : data.gender,
      });
      // Se chegou aqui, o redirect foi bem-sucedido
      // Não resetar o estado pois o redirect vai acontecer
    } catch (err: any) {
      // NEXT_REDIRECT é um erro esperado quando redirect() é chamado
      if (err.message?.includes("NEXT_REDIRECT") || err.digest === "NEXT_REDIRECT") {
        // Redirect está funcionando, não fazer nada
        return;
      }
      setError(err.message || "Erro ao salvar pet");
      setIsSubmitting(false);
    }
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
                value={field.value && field.value !== "" ? field.value : undefined}
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Pet</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome do pet" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espécie</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value && field.value !== "" ? field.value : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DOG">Cachorro</SelectItem>
                    <SelectItem value="CAT">Gato</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Porte</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value && field.value !== "" ? field.value : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MINI">Mini</SelectItem>
                    <SelectItem value="SMALL">Pequeno</SelectItem>
                    <SelectItem value="MEDIUM">Médio</SelectItem>
                    <SelectItem value="LARGE">Grande</SelectItem>
                    <SelectItem value="GIANT">Gigante</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raça</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Raça do pet" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : value);
                    }}
                    placeholder="Peso em kg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value || undefined)}
                  value={field.value && field.value !== "" ? field.value : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MALE">Macho</SelectItem>
                    <SelectItem value="FEMALE">Fêmea</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Nascimento</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      field.value
                        ? typeof field.value === "string"
                          ? field.value.split("T")[0]
                          : format(new Date(field.value), "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Cor do pet" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medicalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Médicas</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Observações médicas importantes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="behaviorNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações de Comportamento</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Observações sobre comportamento"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="photoFile"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Foto do Pet</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    {...field}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                    }}
                  />
                </FormControl>
                <FormMessage />
                {value && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(value)}
                      alt="Preview"
                      className="h-32 w-32 rounded-lg object-cover"
                    />
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="photoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Foto (ou use upload acima)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Pet"}
        </Button>
      </form>
    </Form>
  );
}

