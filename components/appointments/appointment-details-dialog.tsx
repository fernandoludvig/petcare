"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { deleteAppointment, markAsCompleted, markAsPaid } from "@/app/actions/appointments";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2, CheckCircle, DollarSign } from "lucide-react";
import Link from "next/link";
import { AppointmentWithRelations } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppointmentDetailsDialogProps {
  appointment: AppointmentWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não Compareceu",
};

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-500",
  CONFIRMED: "bg-green-500",
  IN_PROGRESS: "bg-yellow-500",
  COMPLETED: "bg-gray-500",
  CANCELLED: "bg-red-500",
  NO_SHOW: "bg-orange-500",
};

const paymentMethodLabels: Record<string, string> = {
  CASH: "Dinheiro",
  DEBIT_CARD: "Cartão de Débito",
  CREDIT_CARD: "Cartão de Crédito",
  PIX: "PIX",
  VOUCHER: "Vale",
};

export function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailsDialogProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const router = useRouter();

  if (!appointment) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAppointment(appointment.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Erro ao excluir agendamento");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    if (appointment.status === "COMPLETED") {
      return;
    }
    
    setIsCompleting(true);
    try {
      await markAsCompleted(appointment.id);
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Erro ao marcar agendamento como realizado");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setIsPaying(true);
    try {
      await markAsPaid(appointment.id, paymentMethod || undefined);
      setShowPaymentDialog(false);
      setPaymentMethod("");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Erro ao marcar agendamento como pago");
    } finally {
      setIsPaying(false);
    }
  };

  const startTime = appointment.startTime ? new Date(appointment.startTime) : null;
  const endTime = appointment.endTime ? new Date(appointment.endTime) : null;

  return (
    <>
      <Dialog open={open && !showDeleteDialog} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
            <DialogDescription>
              Informações completas do agendamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pet</label>
                <p className="font-medium">{appointment.pet?.name || "N/A"}</p>
                {appointment.pet && (
                  <Link
                    href={`/pets/${appointment.pet.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Ver detalhes do pet
                  </Link>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                <p className="font-medium">{appointment.client?.name || "N/A"}</p>
                {appointment.client && (
                  <Link
                    href={`/clientes/${appointment.client.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Ver detalhes do cliente
                  </Link>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Serviço</label>
                <p className="font-medium">{appointment.service?.name || "N/A"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge
                    className={statusColors[appointment.status] || "bg-gray-500"}
                  >
                    {statusLabels[appointment.status] || appointment.status}
                  </Badge>
                </div>
              </div>

              {startTime && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data e Hora</label>
                  <p className="font-medium">
                    {format(startTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  {endTime && (
                    <p className="text-sm text-muted-foreground">
                      até {format(endTime, "HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Preço</label>
                <p className="font-medium">R$ {appointment.price?.toFixed(2) || "0.00"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Pagamento</label>
                <div className="font-medium">
                  {appointment.paid ? (
                    <Badge className="bg-green-500">Pago</Badge>
                  ) : (
                    <Badge variant="outline">Pendente</Badge>
                  )}
                </div>
                {appointment.paid && appointment.paymentMethod && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {paymentMethodLabels[appointment.paymentMethod] || appointment.paymentMethod}
                  </p>
                )}
              </div>

              {appointment.assignedTo && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Atribuído a</label>
                  <p className="font-medium">{appointment.assignedTo.name}</p>
                </div>
              )}

              {appointment.notes && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Observações</label>
                  <p className="text-sm">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Link href={`/agendamentos/${appointment.id}/editar`}>
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            {appointment.status !== "COMPLETED" && (
              <Button
                onClick={handleMarkAsCompleted}
                disabled={isCompleting}
                variant="secondary"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {isCompleting ? "Marcando..." : "Realizado"}
              </Button>
            )}
            {!appointment.paid && (
              <Button
                onClick={() => setShowPaymentDialog(true)}
                disabled={isPaying}
                variant="secondary"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Marcar como Pago
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Agendamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Pago</DialogTitle>
            <DialogDescription>
              Selecione o método de pagamento utilizado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Método de Pagamento</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Dinheiro</SelectItem>
                  <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                  <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="VOUCHER">Vale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Valor: <span className="font-medium">R$ {appointment.price?.toFixed(2) || "0.00"}</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentDialog(false);
                setPaymentMethod("");
              }}
              disabled={isPaying}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              disabled={isPaying || !paymentMethod}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPaying ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

