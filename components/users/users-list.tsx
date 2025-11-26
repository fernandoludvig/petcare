"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@prisma/client";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { UserActions } from "@/components/users/user-actions";

interface UsersListProps {
  users: User[];
  currentUserId?: string;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  GROOMER: "Tosador",
  BATHER: "Banhista",
  ATTENDANT: "Atendente",
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-500",
  GROOMER: "bg-blue-500",
  BATHER: "bg-green-500",
  ATTENDANT: "bg-gray-500",
};

export function UsersList({ users, currentUserId }: UsersListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={roleColors[user.role] || "bg-gray-500"}>
                    {roleLabels[user.role] || user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Ativo
                  </Badge>
                </TableCell>
                <TableCell>
                  <UserActions userId={user.id} currentUserId={currentUserId} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

