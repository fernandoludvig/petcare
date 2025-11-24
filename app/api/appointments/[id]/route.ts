import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/auth";
import { updateAppointmentSchema } from "@/lib/validations/appointment";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organization = await getCurrentOrganization();
    const { id } = await params;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: organization.id,
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

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar agendamento" },
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

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    const validatedData = updateAppointmentSchema.parse(body);

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: validatedData,
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

    return NextResponse.json(updatedAppointment);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar agendamento" },
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

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao cancelar agendamento" },
      { status: 500 }
    );
  }
}

