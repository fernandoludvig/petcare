import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  const organization = await prisma.organization.findFirst();
  
  if (!organization) {
    console.log("Nenhuma organização encontrada. Execute o seed após criar uma conta.");
    return;
  }

  const services = [
    {
      name: "Banho",
      description: "Banho completo com produtos de qualidade",
      priceMini: 30,
      priceSmall: 40,
      priceMedium: 50,
      priceLarge: 60,
      priceGiant: 70,
      durationMini: 30,
      durationSmall: 45,
      durationMedium: 60,
      durationLarge: 75,
      durationGiant: 90,
      organizationId: organization.id,
    },
    {
      name: "Tosa",
      description: "Tosa higiênica e estética",
      priceMini: 40,
      priceSmall: 50,
      priceMedium: 60,
      priceLarge: 80,
      priceGiant: 100,
      durationMini: 45,
      durationSmall: 60,
      durationMedium: 75,
      durationLarge: 90,
      durationGiant: 120,
      organizationId: organization.id,
    },
    {
      name: "Banho + Tosa",
      description: "Banho completo seguido de tosa",
      priceMini: 60,
      priceSmall: 80,
      priceMedium: 100,
      priceLarge: 120,
      priceGiant: 150,
      durationMini: 60,
      durationSmall: 90,
      durationMedium: 120,
      durationLarge: 150,
      durationGiant: 180,
      organizationId: organization.id,
    },
    {
      name: "Tosa Higiênica",
      description: "Tosa focada em áreas higiênicas (região íntima, patas, focinho)",
      priceMini: 25,
      priceSmall: 35,
      priceMedium: 45,
      priceLarge: 55,
      priceGiant: 65,
      durationMini: 20,
      durationSmall: 30,
      durationMedium: 40,
      durationLarge: 50,
      durationGiant: 60,
      organizationId: organization.id,
    },
    {
      name: "Corte de Unhas",
      description: "Corte e lixamento de unhas",
      priceMini: 15,
      priceSmall: 20,
      priceMedium: 25,
      priceLarge: 30,
      priceGiant: 35,
      durationMini: 10,
      durationSmall: 15,
      durationMedium: 20,
      durationLarge: 25,
      durationGiant: 30,
      organizationId: organization.id,
    },
    {
      name: "Limpeza de Ouvidos",
      description: "Limpeza completa dos ouvidos",
      priceMini: 20,
      priceSmall: 25,
      priceMedium: 30,
      priceLarge: 35,
      priceGiant: 40,
      durationMini: 15,
      durationSmall: 20,
      durationMedium: 25,
      durationLarge: 30,
      durationGiant: 35,
      organizationId: organization.id,
    },
    {
      name: "Escovação de Dentes",
      description: "Escovação dental com produtos específicos",
      priceMini: 25,
      priceSmall: 30,
      priceMedium: 35,
      priceLarge: 40,
      priceGiant: 45,
      durationMini: 15,
      durationSmall: 20,
      durationMedium: 25,
      durationLarge: 30,
      durationGiant: 35,
      organizationId: organization.id,
    },
    {
      name: "Hidratação",
      description: "Tratamento hidratante para pelos",
      priceMini: 35,
      priceSmall: 45,
      priceMedium: 55,
      priceLarge: 65,
      priceGiant: 75,
      durationMini: 30,
      durationSmall: 40,
      durationMedium: 50,
      durationLarge: 60,
      durationGiant: 70,
      organizationId: organization.id,
    },
    {
      name: "Tosa na Máquina",
      description: "Tosa realizada com máquina de tosa",
      priceMini: 35,
      priceSmall: 45,
      priceMedium: 55,
      priceLarge: 70,
      priceGiant: 85,
      durationMini: 40,
      durationSmall: 50,
      durationMedium: 60,
      durationLarge: 75,
      durationGiant: 90,
      organizationId: organization.id,
    },
    {
      name: "Tosa Tesoura",
      description: "Tosa artesanal realizada com tesoura",
      priceMini: 45,
      priceSmall: 55,
      priceMedium: 65,
      priceLarge: 85,
      priceGiant: 105,
      durationMini: 50,
      durationSmall: 60,
      durationMedium: 75,
      durationLarge: 90,
      durationGiant: 120,
      organizationId: organization.id,
    },
    {
      name: "Banho Medicado",
      description: "Banho com produtos medicinais específicos",
      priceMini: 40,
      priceSmall: 50,
      priceMedium: 60,
      priceLarge: 70,
      priceGiant: 80,
      durationMini: 35,
      durationSmall: 45,
      durationMedium: 55,
      durationLarge: 65,
      durationGiant: 75,
      organizationId: organization.id,
    },
    {
      name: "Desembaraço",
      description: "Desembaraço completo dos pelos",
      priceMini: 30,
      priceSmall: 40,
      priceMedium: 50,
      priceLarge: 60,
      priceGiant: 70,
      durationMini: 25,
      durationSmall: 35,
      durationMedium: 45,
      durationLarge: 55,
      durationGiant: 65,
      organizationId: organization.id,
    },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: {
        organizationId: organization.id,
        name: service.name,
      },
    });

    if (!existing) {
      await prisma.service.create({
        data: service,
      });
    }
  }

  console.log("Serviços criados!");

  const clients = [
    {
      name: "Maria Silva",
      email: "maria.silva@email.com",
      phone: "11987654321",
      cpf: "12345678901",
      address: "Rua das Flores, 123",
      organizationId: organization.id,
    },
    {
      name: "João Santos",
      email: "joao.santos@email.com",
      phone: "11976543210",
      cpf: "23456789012",
      organizationId: organization.id,
    },
    {
      name: "Ana Costa",
      email: "ana.costa@email.com",
      phone: "11965432109",
      organizationId: organization.id,
    },
    {
      name: "Pedro Oliveira",
      email: "pedro.oliveira@email.com",
      phone: "11954321098",
      organizationId: organization.id,
    },
    {
      name: "Carla Mendes",
      email: "carla.mendes@email.com",
      phone: "11943210987",
      organizationId: organization.id,
    },
  ];

  const createdClients = [];
  for (const client of clients) {
    const created = await prisma.client.upsert({
      where: {
        organizationId_phone: {
          organizationId: organization.id,
          phone: client.phone,
        },
      },
      update: client,
      create: client,
    });
    createdClients.push(created);
  }

  console.log("Clientes criados!");

  const pets = [
    {
      name: "Rex",
      species: "DOG" as const,
      breed: "Golden Retriever",
      size: "LARGE" as const,
      weight: 30,
      gender: "MALE" as const,
      color: "Dourado",
      clientId: createdClients[0].id,
      organizationId: organization.id,
    },
    {
      name: "Luna",
      species: "DOG" as const,
      breed: "Poodle",
      size: "SMALL" as const,
      weight: 5,
      gender: "FEMALE" as const,
      color: "Branco",
      clientId: createdClients[0].id,
      organizationId: organization.id,
    },
    {
      name: "Thor",
      species: "DOG" as const,
      breed: "Bulldog",
      size: "MEDIUM" as const,
      weight: 20,
      gender: "MALE" as const,
      color: "Marrom",
      clientId: createdClients[1].id,
      organizationId: organization.id,
    },
    {
      name: "Mimi",
      species: "CAT" as const,
      breed: "Persa",
      size: "SMALL" as const,
      weight: 4,
      gender: "FEMALE" as const,
      color: "Cinza",
      clientId: createdClients[2].id,
      organizationId: organization.id,
    },
    {
      name: "Max",
      species: "DOG" as const,
      breed: "Yorkshire",
      size: "MINI" as const,
      weight: 3,
      gender: "MALE" as const,
      color: "Preto e Marrom",
      clientId: createdClients[2].id,
      organizationId: organization.id,
    },
    {
      name: "Bella",
      species: "DOG" as const,
      breed: "Labrador",
      size: "LARGE" as const,
      weight: 28,
      gender: "FEMALE" as const,
      color: "Preto",
      clientId: createdClients[3].id,
      organizationId: organization.id,
    },
    {
      name: "Charlie",
      species: "DOG" as const,
      breed: "Beagle",
      size: "MEDIUM" as const,
      weight: 12,
      gender: "MALE" as const,
      color: "Tricolor",
      clientId: createdClients[4].id,
      organizationId: organization.id,
    },
    {
      name: "Nina",
      species: "CAT" as const,
      breed: "Siamês",
      size: "SMALL" as const,
      weight: 3.5,
      gender: "FEMALE" as const,
      color: "Bege e Marrom",
      clientId: createdClients[4].id,
      organizationId: organization.id,
    },
  ];

  const createdPets = [];
  for (const pet of pets) {
    const created = await prisma.pet.create({
      data: pet,
    });
    createdPets.push(created);
  }

  console.log("Pets criados!");

  const allServices = await prisma.service.findMany({
    where: { organizationId: organization.id },
  });

  const appointments = [];
  const today = new Date();
  today.setHours(8, 0, 0, 0);

  for (let i = 0; i < 10; i++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + i);
    
    const hour = 8 + (i % 8);
    appointmentDate.setHours(hour, 0, 0, 0);

    const pet = createdPets[i % createdPets.length];
    const service = allServices[i % allServices.length];
    
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

    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + (durationMap[pet.size] || 60));

    appointments.push({
      startTime: appointmentDate,
      endTime,
      petId: pet.id,
      clientId: pet.clientId,
      serviceId: service.id,
      organizationId: organization.id,
      price: priceMap[pet.size] || 0,
      status: (i < 3 ? "CONFIRMED" : "SCHEDULED") as "CONFIRMED" | "SCHEDULED",
    });
  }

  for (const appointment of appointments) {
    await prisma.appointment.create({
      data: appointment,
    });
  }

  console.log("Agendamentos criados!");
  console.log("Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

