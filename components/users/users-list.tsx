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
import { User } from "@prisma/client";

interface UsersListProps {
  users: User[];
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

export function UsersList({ users }: UsersListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12">
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

