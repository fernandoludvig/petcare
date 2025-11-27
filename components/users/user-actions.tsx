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
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteUser } from "@/app/actions/users";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  userId: string;
  currentUserId?: string;
}

export function UserActions({ userId, currentUserId }: UserActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(userId);
      setShowDeleteDialog(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Erro ao excluir usuário");
    } finally {
      setIsDeleting(false);
    }
  };

  const isCurrentUser = currentUserId === userId;

  return (
    <>
      <div className="flex gap-2">
        <Link href={`/usuarios/${userId}/editar`}>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
        {!isCurrentUser && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
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
    </>
  );
}


