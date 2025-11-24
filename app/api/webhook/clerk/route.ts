import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("WEBHOOK_SECRET não configurado");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Erro: headers ausentes", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Erro ao verificar webhook:", err);
    return new Response("Erro ao verificar webhook", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses[0]?.email_address;

    if (!email) {
      return new Response("Email não encontrado", { status: 400 });
    }

    let organization = await prisma.organization.findUnique({
      where: { clerkId: id },
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: first_name && last_name
            ? `${first_name} ${last_name}`
            : email,
          clerkId: id,
          email,
        },
      });
    } else {
      organization = await prisma.organization.update({
        where: { id: organization.id },
        data: {
          name: first_name && last_name
            ? `${first_name} ${last_name}`
            : email,
          email,
        },
      });
    }

    const user = await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        email,
        name: first_name && last_name
          ? `${first_name} ${last_name}`
          : email,
        avatarUrl: image_url,
      },
      create: {
        clerkId: id,
        email,
        name: first_name && last_name
          ? `${first_name} ${last_name}`
          : email,
        avatarUrl: image_url,
        organizationId: organization.id,
      },
    });

    return new Response(JSON.stringify({ user, organization }), {
      status: 200,
    });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    await prisma.user.deleteMany({
      where: { clerkId: id },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  }

  return new Response("", { status: 200 });
}

