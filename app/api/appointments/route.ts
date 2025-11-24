import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validations/appointment";

export async function GET(request: NextRequest) {
  try {
    const organization = await getCurrentOrganization();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      organizationId: organization.id,
    };

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        pet: {
          include: {
            client: true,
          },
        },
        client: true,
        service: true,
        assignedTo: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const organization = await getCurrentOrganization();
    const body = await request.json();

    const validatedData = appointmentSchema.parse(body);

    const pet = await prisma.pet.findUnique({
      where: { id: validatedData.petId },
      include: { client: true },
    });

    if (!pet || pet.organizationId !== organization.id) {
      return NextResponse.json(
        { error: "Pet não encontrado" },
        { status: 404 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    });

    if (!service || service.organizationId !== organization.id) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    const durationMap: Record<string, number> = {
      MINI: service.durationMini,
      SMALL: service.durationSmall,
      MEDIUM: service.durationMedium,
      LARGE: service.durationLarge,
      GIANT: service.durationGiant,
    };

    const priceMap: Record<string, number> = {
      MINI: service.priceMini || 0,
      SMALL: service.priceSmall || 0,
      MEDIUM: service.priceMedium || 0,
      LARGE: service.priceLarge || 0,
      GIANT: service.priceGiant || 0,
    };

    const duration = durationMap[pet.size] || 60;
    const endTime = new Date(validatedData.startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        organizationId: organization.id,
        status: {
          notIn: ["CANCELLED", "COMPLETED"],
        },
        OR: [
          {
            startTime: {
              lte: validatedData.startTime,
            },
            endTime: {
              gt: validatedData.startTime,
            },
          },
          {
            startTime: {
              lt: endTime,
            },
            endTime: {
              gte: endTime,
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "Já existe um agendamento neste horário" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        startTime: validatedData.startTime,
        endTime,
        petId: validatedData.petId,
        clientId: validatedData.clientId,
        serviceId: validatedData.serviceId,
        assignedToId: validatedData.assignedToId,
        organizationId: organization.id,
        price: validatedData.price || priceMap[pet.size] || 0,
        notes: validatedData.notes,
      },
      include: {
        pet: {
          include: {
            client: true,
          },
        },
        client: true,
        service: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}

