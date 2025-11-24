import { 
  Organization, 
  User, 
  Client, 
  Pet, 
  Service, 
  Appointment,
  UserRole,
  Species,
  PetSize,
  Gender,
  AppointmentStatus,
  PaymentMethod
} from "@prisma/client";

export type {
  Organization,
  User,
  Client,
  Pet,
  Service,
  Appointment,
  UserRole,
  Species,
  PetSize,
  Gender,
  AppointmentStatus,
  PaymentMethod,
};

export type PetWithClient = Pet & {
  client: Client;
};

export type AppointmentWithRelations = Appointment & {
  pet: PetWithClient;
  client: Client;
  service: Service;
  assignedTo: User | null;
};

export type ClientWithPets = Client & {
  pets: Pet[];
  _count?: {
    appointments: number;
  };
};

