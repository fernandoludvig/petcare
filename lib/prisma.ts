import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Adicionar tratamento de desconexão
prisma.$on("error" as never, (e: any) => {
  console.error("Prisma error:", e);
});

// Função helper para executar queries com retry
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Se for erro de conexão, tentar reconectar
      const isConnectionError = 
        error.message?.includes("closed the connection") ||
        error.message?.includes("Connection") ||
        error.message?.includes("Server has closed") ||
        error.code === "P1001" ||
        error.code === "P1008" ||
        error.code === "P1017";
      
      if (isConnectionError) {
        if (i < maxRetries - 1) {
          console.log(`Retry attempt ${i + 1}/${maxRetries}...`);
          
          // Tentar desconectar e reconectar
          try {
            await prisma.$disconnect();
          } catch (disconnectError) {
            // Ignorar erros de desconexão
          }
          
          // Aguardar antes de tentar novamente
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
          
          // Tentar reconectar
          try {
            await prisma.$connect();
          } catch (connectError) {
            // Se não conseguir reconectar, continuar mesmo assim
            console.warn("Could not reconnect, continuing anyway...");
          }
          
          continue;
        }
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error("Unknown error");
}

