import { notFound, redirect } from "next/navigation";
import { ServiceForm } from "@/components/services/service-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { updateService } from "@/app/actions/services";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await getCurrentOrganization();

  const service = await prisma.service.findFirst({
    where: {
      id,
      organizationId: organization.id,
    },
  });

  if (!service) {
    notFound();
  }

  async function handleSubmit(data: any) {
    "use server";
    await updateService(id, data);
    redirect("/servicos");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/servicos">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Serviço</h1>
          <p className="text-muted-foreground">
            Edite as informações do serviço
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm
            onSubmit={handleSubmit}
            defaultValues={{
              name: service.name,
              description: service.description || "",
              priceMini: service.priceMini || "",
              priceSmall: service.priceSmall || "",
              priceMedium: service.priceMedium || "",
              priceLarge: service.priceLarge || "",
              priceGiant: service.priceGiant || "",
              durationMini: service.durationMini,
              durationSmall: service.durationSmall,
              durationMedium: service.durationMedium,
              durationLarge: service.durationLarge,
              durationGiant: service.durationGiant,
              active: service.active,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

