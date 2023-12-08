import { PrismaClient } from "@prisma/client";

export abstract class Repository {
  protected prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
}
