import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";

async function getOrganizationData() {
  const organization = await getCurrentOrganization();

  const users = await prisma.user.findMany({
    where: {
      organizationId: organization.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return { organization, users };
}

export default async function SettingsPage() {
  const { organization, users } = await getOrganizationData();

  const businessHours = (organization.businessHours as any) || {
    seg: "08:00-18:00",
    ter: "08:00-18:00",
    qua: "08:00-18:00",
    qui: "08:00-18:00",
    sex: "08:00-18:00",
    sab: "08:00-14:00",
    dom: "Fechado",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua organização
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Organização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <p className="text-sm text-muted-foreground">{organization.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-sm text-muted-foreground">{organization.email}</p>
          </div>
          {organization.phone && (
            <div>
              <label className="text-sm font-medium">Telefone</label>
              <p className="text-sm text-muted-foreground">
                {organization.phone}
              </p>
            </div>
          )}
          {organization.address && (
            <div>
              <label className="text-sm font-medium">Endereço</label>
              <p className="text-sm text-muted-foreground">
                {organization.address}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horário de Funcionamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(businessHours).map(([day, hours]) => (
              <div key={day} className="flex justify-between">
                <span className="font-medium capitalize">{day}</span>
                <span className="text-muted-foreground">{hours as string}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários/Funcionários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

