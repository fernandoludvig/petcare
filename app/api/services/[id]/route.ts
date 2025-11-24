import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { serviceSchema } from "@/lib/validations/service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organization = await getCurrentOrganization();
    const { id } = await params;
    const body = await request.json();

    const service = await prisma.service.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    const validatedData = serviceSchema.parse(body);

    const updatedService = await prisma.service.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedService);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar serviço" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organization = await getCurrentOrganization();
    const { id } = await params;

    const service = await prisma.service.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    await prisma.service.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao desativar serviço" },
      { status: 500 }
    );
  }
}

