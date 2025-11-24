import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { serviceSchema } from "@/lib/validations/service";

export async function GET(request: NextRequest) {
  try {
    const organization = await getCurrentOrganization();

    const services = await prisma.service.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(services);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar serviços" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const organization = await getCurrentOrganization();
    const body = await request.json();

    const validatedData = serviceSchema.parse(body);

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        organizationId: organization.id,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Erro ao criar serviço" },
      { status: 500 }
    );
  }
}

