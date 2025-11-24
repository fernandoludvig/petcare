import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { clientSchema } from "@/lib/validations/client";

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
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        pets: true,
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const organization = await getCurrentOrganization();
    const body = await request.json();

    const validatedData = clientSchema.parse(body);

    const existingClient = await prisma.client.findFirst({
      where: {
        organizationId: organization.id,
        phone: validatedData.phone,
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Já existe um cliente com este telefone" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        ...validatedData,
        organizationId: organization.id,
      },
      include: {
        pets: true,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}

