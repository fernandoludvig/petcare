"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deletePet } from "@/app/actions/pets";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Link from "next/link";

const speciesLabels: Record<string, string> = {
  DOG: "Cachorro",
  CAT: "Gato",
  OTHER: "Outro",
};

const sizeLabels: Record<string, string> = {
  MINI: "Mini",
  SMALL: "Pequeno",
  MEDIUM: "Médio",
  LARGE: "Grande",
  GIANT: "Gigante",
};

interface PetCardProps {
  pet: {
    id: string;
    name: string;
    species: string;
    size: string;
    photoUrl: string | null;
    medicalNotes: string | null;
    client: {
      id: string;
      name: string;
    };
  };
}

export function PetCard({ pet }: PetCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePet(pet.id);
      setShowDeleteDialog(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Erro ao excluir pet");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="relative group transition-shadow hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={pet.photoUrl || undefined} />
              <AvatarFallback>{pet.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <Link href={`/pets/${pet.id}`}>
                  <h3 className="font-semibold hover:underline">{pet.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground">{pet.client.name}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{speciesLabels[pet.species]}</Badge>
                <Badge variant="outline">{sizeLabels[pet.size]}</Badge>
              </div>
              {pet.medicalNotes && (
                <p className="text-xs text-red-600">⚠️ Observações médicas</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Pet</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o pet <strong>{pet.name}</strong>? Esta ação não pode ser desfeita.
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

