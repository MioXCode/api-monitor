import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  errorFormat: "pretty",
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export { prisma };
