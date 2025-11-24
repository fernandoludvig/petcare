import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { clientSchema } from "@/lib/validations/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organization = await getCurrentOrganization();
    const { id } = await params;

    const client = await prisma.client.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
      include: {
        Pet: true,
        Appointment: {
          include: {
            Pet: true,
            Service: true,
          },
          orderBy: {
            startTime: "desc",
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar cliente" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organization = await getCurrentOrganization();
    const { id } = await params;
    const body = await request.json();

    const client = await prisma.client.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const validatedData = clientSchema.parse(body);

    const updatedClient = await prisma.client.update({
      where: { id },
      data: validatedData,
      include: {
        Pet: true,
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}

