import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Release the connection pool on graceful shutdown (PM2 reload, Ctrl+C).
// Without this, the OS holds onto sockets until TCP keepalive expires.
if (process.env.NODE_ENV === "production" && !(globalForPrisma as { __shutdownHooked?: boolean }).__shutdownHooked) {
  (globalForPrisma as { __shutdownHooked?: boolean }).__shutdownHooked = true;
  const close = () => { db.$disconnect().catch(() => {}); };
  process.once("beforeExit", close);
  process.once("SIGTERM", close);
  process.once("SIGINT", close);
}
