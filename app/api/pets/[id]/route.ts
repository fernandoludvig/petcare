import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { petSchema } from "@/lib/validations/pet";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organization = await getCurrentOrganization();
    const { id } = await params;

    const pet = await prisma.pet.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
      include: {
        Client: true,
        Appointment: {
          include: {
            Service: true,
          },
          orderBy: {
            startTime: "desc",
          },
        },
      },
    });

    if (!pet) {
      return NextResponse.json(
        { error: "Pet não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(pet);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar pet" },
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

    const pet = await prisma.pet.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!pet) {
      return NextResponse.json(
        { error: "Pet não encontrado" },
        { status: 404 }
      );
    }

    const validatedData = petSchema.parse(body);

    const updatedPet = await prisma.pet.update({
      where: { id },
      data: validatedData,
      include: {
        Client: true,
      },
    });

    return NextResponse.json(updatedPet);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar pet" },
      { status: 500 }
    );
  }
}

