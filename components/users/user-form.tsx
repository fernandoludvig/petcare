"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@/lib/validations/user";
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

interface UserFormProps {
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export function UserForm({ onSubmit, defaultValues }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      role: "ATTENDANT",
    },
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      console.log("Form submitting with data:", data);
      await onSubmit(data);
      // Se chegou aqui, o redirect foi bem-sucedido
      // Não resetar o estado pois o redirect vai acontecer
    } catch (err: any) {
      console.error("Form submission error:", err);
      
      // NEXT_REDIRECT é um erro esperado quando redirect() é chamado
      if (err.message?.includes("NEXT_REDIRECT") || err.digest === "NEXT_REDIRECT") {
        // Redirect está funcionando, não fazer nada
        return;
      }
      
      const errorMessage = err.message || err.toString() || "Erro ao salvar usuário";
      console.error("Error message:", errorMessage);
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome completo" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} placeholder="email@exemplo.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perfil</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || "ATTENDANT"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador - Acesso total</SelectItem>
                  <SelectItem value="ATTENDANT">Atendente - Acesso limitado</SelectItem>
                  <SelectItem value="GROOMER">Tosador - Acesso limitado</SelectItem>
                  <SelectItem value="BATHER">Banhista - Acesso limitado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            Um email será enviado para o endereço informado com instruções para criar a senha de acesso.
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Processando..." : defaultValues ? "Salvar Alterações" : "Criar Usuário e Enviar Convite"}
        </Button>
      </form>
    </Form>
  );
}

