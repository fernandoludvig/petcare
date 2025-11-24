import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { petSchema } from "@/lib/validations/pet";

export async function GET(request: NextRequest) {
  try {
    const organization = await getCurrentOrganization();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: any = {
      organizationId: organization.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        {
          client: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const pets = await prisma.pet.findMany({
      where,
      include: {
        client: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pets);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar pets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const organization = await getCurrentOrganization();
    const body = await request.json();

    const validatedData = petSchema.parse(body);

    const client = await prisma.client.findFirst({
      where: {
        id: validatedData.clientId,
        organizationId: organization.id,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const pet = await prisma.pet.create({
      data: {
        ...validatedData,
        organizationId: organization.id,
      },
      include: {
        client: true,
      },
    });

    return NextResponse.json(pet, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Erro ao criar pet" },
      { status: 500 }
    );
  }
}

